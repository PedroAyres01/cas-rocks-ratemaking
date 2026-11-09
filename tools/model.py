"""Réplica em Python da planilha do caso (CAS Auto PD Liability), com seleções parametrizáveis.

Fonte única dos números do site: exporta src/data/caso.json (dados brutos) e
src/data/referencia.json (saídas esperadas, usadas para testar o motor JS).
Uso: uv run --with openpyxl --with numpy python tools/model.py
"""
import math, sys, json, copy, os
import openpyxl
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "..", "Estudo de Caso - Auto - Alunos (3).xlsx")
wb = openpyxl.load_workbook(SRC, data_only=True)

def col(ws, c, r0, r1):
    return [ws[f"{c}{r}"].value for r in range(r0, r1 + 1)]

# ---------------- dados de entrada ----------------
lr = wb["LR Indication"]
EP = col(lr, "B", 8, 12)
REP = col(lr, "G", 8, 12)
YEARS = [2011, 2012, 2013, 2014, 2015]

crl1 = wb["Current Rate Level - 1"]
RATE_DATES = col(crl1, "B", 9, 14)
crl2 = wb["Current Rate Level - 2"]
EARNED_W = [[crl2.cell(row=r, column=c).value for c in range(2, 9)] for r in range(9, 14)]
WRITTEN_W = [[crl2.cell(row=r, column=c).value for c in range(3, 10)] for r in range(26, 50)]  # 2010Q1..2015Q4

pt1 = wb["Premium Trend - 1"]
WP = col(pt1, "C", 7, 29)          # 2010Q2..2015Q4 (rolling 4q)
WEXP = col(pt1, "F", 7, 29)

ld = wb["Loss Development"]
TRI = [[ld.cell(row=r, column=c).value for c in range(4, 9)] for r in range(9, 16)]  # AY2009..2015, 15..63m

lt1 = wb["Loss Trend - 1"]
EEXP = col(lt1, "C", 8, 27); CLM = col(lt1, "D", 8, 27); PAID = col(lt1, "E", 8, 27)

ex = wb["Expense"]
EXP = {}
for name, ra, rb in [("gen", 10, 11), ("acq", 18, 19), ("lic", 26, 27), ("com", 34, 35), ("tax", 42, 43)]:
    EXP[name] = ([ex[f"{c}{ra}"].value for c in "EFG"], [ex[f"{c}{rb}"].value for c in "EFG"])
FIXED_PCT = {"gen": 0.75, "acq": 0.75, "lic": 1.0, "com": 0.0, "tax": 0.0}

ul = wb["ULAE"]
PAID_CW = col(ul, "B", 10, 12); ULAE_CW = col(ul, "C", 10, 12)

def logest_annual(y):
    x = np.arange(1, len(y) + 1)
    slope = np.polyfit(x, np.log(np.array(y, dtype=float)), 1)[0]
    return math.exp(slope) ** 4 - 1

def yearfrac30(d1, d2):  # YEARFRAC base 0 (US 30/360) para datas de dia 1
    return ((d2[0] - d1[0]) * 360 + (d2[1] - d1[1]) * 30 + (d2[2] - d1[2])) / 360

BASE = dict(
    rate_changes=[-0.05, 0.10, 0.05, -0.02, 0.05, 0.05],
    prem_trend=0.02,
    ldf_sel=[1.0665, 1.0279, 1.0208, 0.9799, 1.0000],
    freq=(-0.01, -0.01), sev=(0.005, 0.015),
    proj_period=2.25,          # correto; a planilha mostra 2,7333 por bug de DATEVALUE em Excel pt-BR
    gen_exp=None,              # None = dados originais
    exp_sel=dict(gen=0.063, acq=0.085, lic=0.002, com=0.112, tax=0.021),
    ulae_sel=0.143,
    profit=0.05,
    n_claims=3612, full_cred=1082,
    latest_indication=0.132,
)

# Cenário do grupo: valores exatos da planilha "Estudo de Caso - Grupo COMPLETO com resumos.xlsx"
# (LDF = média de todos os anos; despesas = média ponderada; ULAE = média ponderada de 3 anos)
FINAL = copy.deepcopy(BASE)
FINAL.update(gen_exp=[39143368, 39940978, 40763160], rate_changes=[-0.03, 0.10, 0.07, -0.02, 0.07, 0.05],
             prem_trend=0.0135,
             ldf_sel=[1.0703439936468777, 1.0380030065235797, 1.0112573795081794, 0.9897849582219368, 1.0],
             sev=(0.005, 0.02),
             exp_sel=dict(gen=0.08340831904214963, acq=0.08254782227763663, lic=0.00234256146001567,
                          com=0.11233182062385542, tax=0.041578111408699055),
             ulae_sel=0.143400499759598)

def run(p):
    out = {}
    # ---- nível de tarifa ----
    idx = [1.0]
    for rc in p["rate_changes"]:
        idx.append(idx[-1] * (1 + rc))
    cur = idx[-1]
    avg_e = [sum(w * i for w, i in zip(row, idx)) for row in EARNED_W]
    crl = [round(cur / a, 4) for a in avg_e]
    avg_w = [sum(w * i for w, i in zip(row, idx)) for row in WRITTEN_W]
    crl_w = [cur / a for a in avg_w]  # 2010Q1..2015Q4
    out["crl"] = crl; out["cum_index"] = idx
    # ---- tendência de prêmio ----
    G = [WP[i] * crl_w[i + 1] / WEXP[i] for i in range(len(WP))]  # row7 = 2010Q2 -> crl_w[1]
    fits = {}
    for n, start in [(20, 3), (16, 7), (12, 11), (8, 15), (6, 17), (4, 19)]:
        fits[n] = logest_annual(G[start:])
    out["prem_fits"] = fits; out["avg_prem_crl"] = G
    t = p["prem_trend"]
    eff = (2017, 7, 1)  # EDATE(EffDate,6)
    ptf = [round((1 + t) ** yearfrac30((y, 4, 1), eff), 4) for y in YEARS]
    out["ptf"] = ptf
    proj_ep = [e * c * f for e, c, f in zip(EP, crl, ptf)]
    out["proj_ep"] = proj_ep
    # ---- desenvolvimento ----
    sel = p["ldf_sel"]
    ata = [math.prod(sel[i:]) for i in range(5)]  # 15,27,39,51,63 -> ult
    ldf_by_year = [round(ata[4], 4), round(ata[3], 4), round(ata[2], 4), round(ata[1], 4), round(ata[0], 4)]
    out["ldf"] = ldf_by_year; out["ata_ult"] = ata
    # ---- tendência de sinistros ----
    F = [c / e for c, e in zip(CLM, EEXP)]; S = [pd_ / c for pd_, c in zip(PAID, CLM)]; PPm = [pd_ / e for pd_, e in zip(PAID, EEXP)]
    lfits = {}
    for n, start in [(20, 0), (16, 4), (12, 8), (8, 12), (6, 14), (4, 16)]:
        lfits[n] = (logest_annual(F[start:]), logest_annual(S[start:]), logest_annual(PPm[start:]))
    out["loss_fits"] = lfits
    pp_cur = (1 + p["freq"][0]) * (1 + p["sev"][0]) - 1
    pp_proj = (1 + p["freq"][1]) * (1 + p["sev"][1]) - 1
    out["pp_cur"], out["pp_proj"] = pp_cur, pp_proj
    ltf = [round((1 + pp_cur) ** (2015 - y) * (1 + pp_proj) ** p["proj_period"], 4) for y in YEARS]
    out["ltf"] = ltf
    # ---- ULAE ----
    out["ulae_ratios"] = [u / l for u, l in zip(ULAE_CW, PAID_CW)] + [sum(ULAE_CW) / sum(PAID_CW)]
    ulf = 1 + p["ulae_sel"]
    ult = [r * l * tf * ulf for r, l, tf in zip(REP, ldf_by_year, ltf)]
    out["proj_loss"] = ult
    lr_y = [u / e for u, e in zip(ult, proj_ep)]
    LR = sum(ult) / sum(proj_ep)
    out["lr_by_year"] = lr_y; out["LR"] = LR
    # ---- despesas ----
    ratios = {}
    for k, (a, b) in EXP.items():
        a = list(a)
        if k == "gen" and p["gen_exp"]:
            a = p["gen_exp"]
        ratios[k] = ([x / y for x, y in zip(a, b)], sum(a) / sum(b))
    out["exp_ratios"] = ratios
    fixed = sum(p["exp_sel"][k] * FIXED_PCT[k] for k in FIXED_PCT)
    var = sum(p["exp_sel"][k] * (1 - FIXED_PCT[k]) for k in FIXED_PCT)
    out["fixed"], out["var"] = fixed, var
    vplr = 1 - var - p["profit"]
    ind = (LR + fixed) / vplr - 1
    out["vplr"], out["ind"] = vplr, ind
    # ---- credibilidade ----
    Z = min(math.sqrt(p["n_claims"] / p["full_cred"]), 1)
    last = p["rate_changes"][-1]
    resid = (1 + p["latest_indication"]) / (1 + last) - 1
    net = (1 + pp_proj) / (1 + t) - 1
    tpr = (1 + resid) * (1 + net) ** 1 - 1
    out["Z"], out["tpr"] = Z, tpr
    out["cw"] = ind * Z + tpr * (1 - Z)
    # ---- prêmio médio por veículo ----
    out["avg_prem_2015_crl"] = G[-1]                       # ano encerrado em 2015T4, à tarifa atual
    out["avg_prem_proj"] = G[-1] * (1 + t) ** 2            # de 01/07/2015 a 01/07/2017
    out["avg_prem_new"] = out["avg_prem_proj"] * (1 + out["cw"])
    return out

def export(dest):
    os.makedirs(dest, exist_ok=True)
    caso = dict(years=YEARS, EP=EP, REP=REP, rateDates=[x.strftime("%Y-%m-%d") for x in RATE_DATES],
                earnedW=EARNED_W, writtenW=WRITTEN_W, WP=WP, WEXP=WEXP, tri=TRI, EEXP=EEXP, CLM=CLM, PAID=PAID,
                exp={k: {"a": v[0], "b": v[1]} for k, v in EXP.items()}, fixedPct=FIXED_PCT,
                ulaePaid=PAID_CW, ulaeCW=ULAE_CW, base=BASE, final=FINAL)
    json.dump(caso, open(os.path.join(dest, "caso.json"), "w"), indent=1)
    keys = ("crl", "ptf", "ldf", "ltf", "LR", "fixed", "var", "ind", "Z", "tpr", "cw", "avg_prem_proj",
            "avg_prem_new", "prem_fits", "loss_fits", "lr_by_year", "ulae_ratios", "pp_cur", "pp_proj")
    ref = {k: {x: run(p)[x] for x in keys} for k, p in (("base", BASE), ("final", FINAL))}
    json.dump(ref, open(os.path.join(dest, "referencia.json"), "w"), indent=1)
    return ref

if __name__ == "__main__":
    ref = export(os.path.join(HERE, "..", "src", "data"))
    print({k: round(v["cw"], 5) for k, v in ref.items()}, round(ref["final"]["avg_prem_proj"], 2), round(ref["final"]["avg_prem_new"], 2))
