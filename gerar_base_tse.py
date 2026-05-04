#!/usr/bin/env python3
"""
Script para gerar base eleitoral do TSE para municípios específicos.
Anos: 2018, 2020, 2022
"""

import os
import zipfile
import requests
import pandas as pd
from io import BytesIO
from collections import defaultdict
import unicodedata

# Configurações
CIDADES = [
    "ITATINGA",
    "SÃO MIGUEL ARCANJO",
    "ARANDU",
    "BARRA DO CHAPÉU",
    "BOFETE",
    "BOITUVA",
    "BURI",
    "CAMPINA DO MONTE ALEGRE",
    "CAPÃO BONITO",
    "CAPELA DO ALTO"
]

URLS = {
    2018: "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2018.zip",
    2020: "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2020.zip",
    2022: "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2022.zip"
}

CARGOS_2018_2022 = ["DEPUTADO ESTADUAL", "DEPUTADO FEDERAL"]
CARGOS_2020 = ["PREFEITO", "VEREADOR"]

NOMES_INVALIDOS = {"#NULO", "NULO", "BRANCO", "VOTO BRANCO", "VOTO NULO"}

def normalizar_texto(texto):
    """Remove acentos, espaços extras e converte para maiúsculas"""
    if pd.isna(texto):
        return ""
    texto = str(texto)
    texto = texto.strip()
    texto = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('ASCII')
    texto = texto.upper()
    return texto

# Normalizar nomes de cidades para comparação (sem acentos)
CIDADES_NORMALIZADAS = {normalizar_texto(c) for c in CIDADES}

def baixar_zip(url, ano):
    print(f"Baixando dados de {ano}...")
    response = requests.get(url, timeout=300)
    response.raise_for_status()
    return zipfile.ZipFile(BytesIO(response.content))

def ler_csv_tse(zip_file, ano):
    print(f"Lendo CSV de {ano}...")
    
    # Encontrar CSVs dentro do ZIP
    csv_files = [f for f in zip_file.namelist() if f.endswith('.csv')]
    if not csv_files:
        raise ValueError(f"Nenhum CSV encontrado no ZIP de {ano}")
    
    # Priorizar CSV com "_SP" no nome
    sp_csv = [f for f in csv_files if '_SP' in f.upper()]
    if sp_csv:
        print(f"  Usando CSV específico de SP: {sp_csv[0]}")
        csv_files = sp_csv
    
    dfs = []
    for csv_file in csv_files:
        try:
            with zip_file.open(csv_file) as f:
                df = pd.read_csv(f, encoding='latin1', sep=';', low_memory=False)
                df.columns = df.columns.str.upper()
                dfs.append(df)
                print(f"  Lido: {csv_file} ({len(df)} linhas)")
        except Exception as e:
            print(f"  Erro ao ler {csv_file}: {e}")
    
    if not dfs:
        raise ValueError(f"Não foi possível ler nenhum CSV de {ano}")
    
    # Concatenar todos os CSVs
    df = pd.concat(dfs, ignore_index=True)
    print(f"  Total de linhas no CSV de {ano}: {len(df)}")
    return df

def obter_coluna_votos(df):
    """Preferir QT_VOTOS_NOMINAIS > QT_VOTOS > QT_VOTOS_VALIDOS"""
    if 'QT_VOTOS_NOMINAIS' in df.columns:
        return 'QT_VOTOS_NOMINAIS'
    if 'QT_VOTOS' in df.columns:
        return 'QT_VOTOS'
    if 'QT_VOTOS_VALIDOS' in df.columns:
        return 'QT_VOTOS_VALIDOS'
    raise ValueError("Nenhuma coluna de votos encontrada")

def obter_coluna_nome(df):
    """Preferir NM_URNA_CANDIDATO > NM_CANDIDATO > NM_VOTAVEL"""
    if 'NM_URNA_CANDIDATO' in df.columns:
        return 'NM_URNA_CANDIDATO'
    if 'NM_CANDIDATO' in df.columns:
        return 'NM_CANDIDATO'
    if 'NM_VOTAVEL' in df.columns:
        return 'NM_VOTAVEL'
    raise ValueError("Nenhuma coluna de nome de candidato encontrada")

def obter_coluna_partido(df):
    """Preferir SG_PARTIDO > NM_PARTIDO > SG_PARTIDO_COLIGACAO"""
    if 'SG_PARTIDO' in df.columns:
        return 'SG_PARTIDO'
    if 'NM_PARTIDO' in df.columns:
        return 'NM_PARTIDO'
    if 'SG_PARTIDO_COLIGACAO' in df.columns:
        return 'SG_PARTIDO_COLIGACAO'
    return 'PARTIDO'

def limpar_dados(df, ano):
    """Aplicar filtros e limpezas comuns"""
    
    # Filtrar UF = SP
    if 'SG_UF' in df.columns:
        df = df[df['SG_UF'] == 'SP']
    elif 'UF' in df.columns:
        df = df[df['UF'] == 'SP']
    
    # Filtrar turno = 1
    if 'NR_TURNO' in df.columns:
        df = df[df['NR_TURNO'] == 1]
    
    # Obter colunas
    col_municipio = 'NM_MUNICIPIO' if 'NM_MUNICIPIO' in df.columns else 'MUNICIPIO'
    col_cargo = 'DS_CARGO' if 'DS_CARGO' in df.columns else 'CARGO'
    col_nome = obter_coluna_nome(df)
    col_votos = obter_coluna_votos(df)
    col_partido = obter_coluna_partido(df)
    
    # Criar colunas normalizadas
    if col_municipio in df.columns:
        df['MUNICIPIO_NORM'] = df[col_municipio].apply(normalizar_texto)
    if col_cargo in df.columns:
        df['CARGO_NORM'] = df[col_cargo].apply(normalizar_texto)
    df['NOME_NORM'] = df[col_nome].apply(normalizar_texto)
    df['PARTIDO_NORM'] = df[col_partido].apply(normalizar_texto)
    
    # Remover nomes inválidos (usando coluna normalizada)
    df = df[~df['NOME_NORM'].isin(NOMES_INVALIDOS)]
    df = df[df['NOME_NORM'] != '']
    df = df[df['NOME_NORM'].notna()]
    
    # Para deputados, remover votos de legenda quando não há nome nominal
    if ano in [2018, 2022] and 'CARGO_NORM' in df.columns:
        # Se o cargo for deputado e o nome for muito curto (provavelmente legenda), remover
        is_deputado = df['CARGO_NORM'].isin([normalizar_texto(c) for c in CARGOS_2018_2022])
        nome_curto = df['NOME_NORM'].str.len() < 3
        df = df[~(is_deputado & nome_curto)]
    
    # Filtrar por município (usando coluna normalizada)
    if 'MUNICIPIO_NORM' in df.columns:
        df = df[df['MUNICIPIO_NORM'].isin(CIDADES_NORMALIZADAS)]
    
    return df, col_municipio, col_nome, col_votos, col_partido

def processar_2018_2022(df, ano):
    print(f"\nProcessando {ano}...")
    
    df, col_municipio, col_nome, col_votos, col_partido = limpar_dados(df, ano)
    
    # Normalizar cargos para comparação
    cargos_norm = [normalizar_texto(c) for c in CARGOS_2018_2022]
    
    # Filtrar por cargo (usando CARGO_NORM)
    if 'CARGO_NORM' in df.columns:
        df = df[df['CARGO_NORM'].isin(cargos_norm)]
    
    # Agrupar por município, cargo, candidato e partido (usando colunas normalizadas)
    group_cols = ['MUNICIPIO_NORM', 'CARGO_NORM', 'NOME_NORM', 'PARTIDO_NORM']
    df_grouped = df.groupby(group_cols, dropna=False)[col_votos].sum().reset_index()
    
    # Ordenar por votos decrescente
    df_grouped = df_grouped.sort_values(['MUNICIPIO_NORM', 'CARGO_NORM', col_votos], ascending=[True, True, False])
    
    # Pegar top 4 por cargo e cidade
    resultado = defaultdict(lambda: defaultdict(list))
    
    for cidade in CIDADES_NORMALIZADAS:
        for cargo_norm in cargos_norm:
            subset = df_grouped[(df_grouped['MUNICIPIO_NORM'] == cidade) & (df_grouped['CARGO_NORM'] == cargo_norm)]
            top = subset.head(4)
            
            for _, row in top.iterrows():
                nome = row['NOME_NORM']
                partido = row['PARTIDO_NORM']
                votos = int(row[col_votos])
                resultado[cidade][cargo_norm].append((nome, partido, votos))
    
    print(f"  Processado {len(df_grouped)} agrupamentos para {ano}")
    return resultado, df_grouped, col_municipio, col_nome, col_partido, col_votos

def processar_2020(df):
    print(f"\nProcessando 2020...")
    
    df, col_municipio, col_nome, col_votos, col_partido = limpar_dados(df, 2020)
    
    # Normalizar cargos para comparação
    cargos_norm = [normalizar_texto(c) for c in CARGOS_2020]
    
    # Filtrar por cargo (usando CARGO_NORM)
    if 'CARGO_NORM' in df.columns:
        df = df[df['CARGO_NORM'].isin(cargos_norm)]
    
    # Agrupar por município, cargo, candidato e partido (usando colunas normalizadas)
    group_cols = ['MUNICIPIO_NORM', 'CARGO_NORM', 'NOME_NORM', 'PARTIDO_NORM']
    df_grouped = df.groupby(group_cols, dropna=False)[col_votos].sum().reset_index()
    
    # Ordenar por votos decrescente
    df_grouped = df_grouped.sort_values(['MUNICIPIO_NORM', 'CARGO_NORM', col_votos], ascending=[True, True, False])
    
    resultado = defaultdict(lambda: defaultdict(list))
    
    prefeito_norm = normalizar_texto('PREFEITO')
    vereador_norm = normalizar_texto('VEREADOR')
    
    for cidade in CIDADES_NORMALIZADAS:
        # Prefeito: todos em ordem
        subset_prefeito = df_grouped[(df_grouped['MUNICIPIO_NORM'] == cidade) & (df_grouped['CARGO_NORM'] == prefeito_norm)]
        
        for idx, (_, row) in enumerate(subset_prefeito.iterrows()):
            nome = row['NOME_NORM']
            partido = row['PARTIDO_NORM']
            votos = int(row[col_votos])
            if idx == 0:
                resultado[cidade]['Prefeito'].append((nome, partido, votos))
            else:
                resultado[cidade]['Prefeitos não eleitos'].append((nome, partido, votos))
        
        # Vereador: top 10
        subset_vereador = df_grouped[(df_grouped['MUNICIPIO_NORM'] == cidade) & (df_grouped['CARGO_NORM'] == vereador_norm)]
        top_vereador = subset_vereador.head(10)
        
        for _, row in top_vereador.iterrows():
            nome = row['NOME_NORM']
            partido = row['PARTIDO_NORM']
            votos = int(row[col_votos])
            resultado[cidade]['Vereadores'].append((nome, partido, votos))
    
    print(f"  Processado {len(df_grouped)} agrupamentos para 2020")
    return resultado, df_grouped, col_municipio, col_nome, col_partido, col_votos

def gerar_saida_txt(dados_2018, dados_2020, dados_2022):
    print("\nGerando arquivo base_eleicoes_tse.txt...")
    
    linhas = []
    
    # Nomes de cargos normalizados para exibição
    dep_estadual_norm = normalizar_texto('DEPUTADO ESTADUAL')
    dep_federal_norm = normalizar_texto('DEPUTADO FEDERAL')
    
    for cidade in sorted(CIDADES_NORMALIZADAS):
        linhas.append(f"{cidade}/SP\n")
        
        # 2022
        linhas.append("2022\n")
        if cidade in dados_2022:
            linhas.append("Deputado Estadual:\n")
            for nome, partido, votos in dados_2022[cidade].get(dep_estadual_norm, []):
                linhas.append(f"{nome} ({partido}) - {votos}\n")
            linhas.append("\nDeputado Federal:\n")
            for nome, partido, votos in dados_2022[cidade].get(dep_federal_norm, []):
                linhas.append(f"{nome} ({partido}) - {votos}\n")
        linhas.append("\n")
        
        # 2020
        linhas.append("2020\n")
        if cidade in dados_2020:
            linhas.append("Prefeito:\n")
            for nome, partido, votos in dados_2020[cidade].get('Prefeito', []):
                linhas.append(f"{nome} ({partido}) - {votos}\n")
            linhas.append("\nPrefeitos não eleitos:\n")
            for nome, partido, votos in dados_2020[cidade].get('Prefeitos não eleitos', []):
                linhas.append(f"{nome} ({partido}) - {votos}\n")
            linhas.append("\nVereadores:\n")
            for nome, partido, votos in dados_2020[cidade].get('Vereadores', []):
                linhas.append(f"{nome} ({partido}) - {votos}\n")
        linhas.append("\n")
        
        # 2018
        linhas.append("2018\n")
        if cidade in dados_2018:
            linhas.append("Deputado Estadual:\n")
            for nome, partido, votos in dados_2018[cidade].get(dep_estadual_norm, []):
                linhas.append(f"{nome} ({partido}) - {votos}\n")
            linhas.append("\nDeputado Federal:\n")
            for nome, partido, votos in dados_2018[cidade].get(dep_federal_norm, []):
                linhas.append(f"{nome} ({partido}) - {votos}\n")
        linhas.append("\n" + "-" * 50 + "\n\n")
    
    with open("base_eleicoes_tse.txt", "w", encoding="utf-8") as f:
        f.writelines(linhas)
    
    print("  Arquivo base_eleicoes_tse.txt gerado com sucesso!")

def gerar_saida_csv(dados_2018, dados_2020, dados_2022):
    print("\nGerando arquivo base_eleicoes_tse.csv...")
    
    linhas_csv = []
    linhas_csv.append("ano,municipio,cargo,classificacao,nome_candidato,partido,votos\n")
    
    # Nomes de cargos normalizados
    dep_estadual_norm = normalizar_texto('DEPUTADO ESTADUAL')
    dep_federal_norm = normalizar_texto('DEPUTADO FEDERAL')
    cargos_norm_2018_2022 = [dep_estadual_norm, dep_federal_norm]
    
    # 2022
    for cidade in sorted(CIDADES_NORMALIZADAS):
        for cargo_norm in cargos_norm_2018_2022:
            for idx, (nome, partido, votos) in enumerate(dados_2022[cidade].get(cargo_norm, [])):
                linhas_csv.append(f"2022,{cidade},{cargo_norm},{idx+1},{nome},{partido},{votos}\n")
    
    # 2020
    for cidade in sorted(CIDADES_NORMALIZADAS):
        # Prefeito
        for idx, (nome, partido, votos) in enumerate(dados_2020[cidade].get('Prefeito', [])):
            classif = "Eleito" if idx == 0 else f"Não eleito ({idx})"
            linhas_csv.append(f"2020,{cidade},Prefeito,{classif},{nome},{partido},{votos}\n")
        for idx, (nome, partido, votos) in enumerate(dados_2020[cidade].get('Prefeitos não eleitos', [])):
            linhas_csv.append(f"2020,{cidade},Prefeito,Não eleito ({idx+1}),{nome},{partido},{votos}\n")
        # Vereador
        for idx, (nome, partido, votos) in enumerate(dados_2020[cidade].get('Vereadores', [])):
            linhas_csv.append(f"2020,{cidade},Vereador,{idx+1},{nome},{partido},{votos}\n")
    
    # 2018
    for cidade in sorted(CIDADES_NORMALIZADAS):
        for cargo_norm in cargos_norm_2018_2022:
            for idx, (nome, partido, votos) in enumerate(dados_2018[cidade].get(cargo_norm, [])):
                linhas_csv.append(f"2018,{cidade},{cargo_norm},{idx+1},{nome},{partido},{votos}\n")
    
    with open("base_eleicoes_tse.csv", "w", encoding="utf-8") as f:
        f.writelines(linhas_csv)
    
    print("  Arquivo base_eleicoes_tse.csv gerado com sucesso!")

def main():
    print("=" * 60)
    print("GERADOR DE BASE ELEITORAL TSE")
    print("=" * 60)
    
    total_linhas_por_ano = {}
    cidades_por_ano = {2018: set(), 2020: set(), 2022: set()}
    
    dados_2018 = defaultdict(lambda: defaultdict(list))
    dados_2020 = defaultdict(lambda: defaultdict(list))
    dados_2022 = defaultdict(lambda: defaultdict(list))
    
    # Processar 2022
    try:
        zip_2022 = baixar_zip(URLS[2022], 2022)
        df_2022 = ler_csv_tse(zip_2022, 2022)
        total_linhas_por_ano[2022] = len(df_2022)
        dados_2022, df_2022, *_ = processar_2018_2022(df_2022, 2022)
        cidades_por_ano[2022] = set(dados_2022.keys())
    except Exception as e:
        print(f"Erro ao processar 2022: {e}")
        total_linhas_por_ano[2022] = 0
    
    # Processar 2020
    try:
        zip_2020 = baixar_zip(URLS[2020], 2020)
        df_2020 = ler_csv_tse(zip_2020, 2020)
        total_linhas_por_ano[2020] = len(df_2020)
        dados_2020, df_2020, *_ = processar_2020(df_2020)
        cidades_por_ano[2020] = set(dados_2020.keys())
    except Exception as e:
        print(f"Erro ao processar 2020: {e}")
        total_linhas_por_ano[2020] = 0
    
    # Processar 2018
    try:
        zip_2018 = baixar_zip(URLS[2018], 2018)
        df_2018 = ler_csv_tse(zip_2018, 2018)
        total_linhas_por_ano[2018] = len(df_2018)
        dados_2018, df_2018, *_ = processar_2018_2022(df_2018, 2018)
        cidades_por_ano[2018] = set(dados_2018.keys())
    except Exception as e:
        print(f"Erro ao processar 2018: {e}")
        total_linhas_por_ano[2018] = 0
    
    # Gerar saídas
    gerar_saida_txt(dados_2018, dados_2020, dados_2022)
    gerar_saida_csv(dados_2018, dados_2020, dados_2022)
    
    # Estatísticas
    print("\n" + "=" * 60)
    print("ESTATÍSTICAS")
    print("=" * 60)
    
    for ano in [2022, 2020, 2018]:
        print(f"\n{ano}:")
        print(f"  Total de registros: {total_linhas_por_ano.get(ano, 0):,}")
        print(f"  Cidades com dados: {len(cidades_por_ano[ano])}")
    
    todas_cidades_encontradas = set()
    for ano in [2018, 2020, 2022]:
        todas_cidades_encontradas.update(cidades_por_ano[ano])
    
    print(f"\nTotal de cidades encontradas (qualquer ano): {len(todas_cidades_encontradas)}")
    print(f"Cidades: {', '.join(sorted(todas_cidades_encontradas))}")
    
    cidades_sem_dados = CIDADES_NORMALIZADAS - todas_cidades_encontradas
    if cidades_sem_dados:
        print(f"\nCidades sem dados: {', '.join(sorted(cidades_sem_dados))}")
    
    print("\nVerificação por cidade (anos preenchidos):")
    for cidade in sorted(CIDADES_NORMALIZADAS):
        anos_com_dados = [ano for ano in [2022, 2020, 2018] if cidade in cidades_por_ano[ano]]
        print(f"  {cidade}: {anos_com_dados}")
    
    print("\nArquivos gerados com sucesso:")
    print("- base_eleicoes_tse.txt")
    print("- base_eleicoes_tse.csv")
    print("=" * 60)

if __name__ == "__main__":
    main()
