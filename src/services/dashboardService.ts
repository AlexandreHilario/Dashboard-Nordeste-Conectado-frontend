import api from './api';

/**
 * PONTOS DE INTEGRAÇÃO - DASHBOARD
 * 
 * Todos os endpoints abaixo devem ser implementados no backend
 * e documentados no Swagger em /docs
 */

// Tipos baseados nas consultas SQL fornecidas

export interface EscolasComLabResponse {
  escolas_rurais_com_lab_e_internet: number;
}

export interface MediaComputadoresResponse {
  media_computadores_por_aluno: number;
}

export interface EscolaLanSemBandaLarga {
  nome_escola: string;
  possui_banda_larga: boolean;
  possui_rede_local: boolean;
}

export interface EscolaTabletSemLab {
  nome_escola: string;
  quantidade_tablets: number;
}


export const dashboardService = {
  /**
   * CONSULTA 01
   * GET /dashboard/escolas-lab-internet
   * 
   * Retorna quantidade de escolas rurais com laboratório de informática
   * e internet disponível para alunos
   * 
   * SQL correspondente:
   * SELECT COUNT(*) AS escolas_rurais_com_lab_e_internet
   * FROM escola e
   * JOIN infraestrutura_geral ig ON e.id_infraestrutura_geral = ig.id
   * JOIN infraestrutura_rede ir ON e.id_infraestrutura_rede = ir.id
   * WHERE e.tp_localizacao = 2
   * AND ig.in_laboratorio_informatica = TRUE
   * AND ir.in_internet_alunos = TRUE;
   */
  async getEscolasComLabEInternet(): Promise<EscolasComLabResponse> {
    const response = await api.get<EscolasComLabResponse>(
      '/dashboard/escolas-lab-internet'
    );
    return response.data;
  },
  /**
   * CONSULTA 02
   * GET /dashboard/media-computadores
   * 
   * Retorna média de computadores disponíveis por aluno nas escolas rurais
   * com laboratório de informática
   * 
   * SQL correspondente:
   * SELECT ROUND(AVG(eq.qt_desktop_aluno::numeric / NULLIF(cd.qt_mat_fund_af + cd.qt_mat_med, 0)), 2)
   * AS media_computadores_por_aluno
   * FROM escola e
   * JOIN equipamentos eq ON e.id_equipamentos = eq.id
   * JOIN corpo_discente cd ON e.id_corpo_discente = cd.id
   * JOIN infraestrutura_geral ig ON e.id_infraestrutura_geral = ig.id
   * WHERE e.tp_localizacao = 2
   * AND ig.in_laboratorio_informatica = TRUE;
   */
  async getMediaComputadores(): Promise<MediaComputadoresResponse> {
    const response = await api.get<MediaComputadoresResponse>(
      '/dashboard/media-computadores'
    );
    return response.data;
  },

  /**
   * CONSULTA 03
   * GET /dashboard/escolas-lan-sem-banda-larga
   * 
   * Retorna escolas rurais com rede local (LAN) mas sem banda larga
   * Deve retornar 871 resultados conforme especificado
   * 
   * SQL correspondente:
   * SELECT e.no_entidade AS nome_escola,
   *        ir.in_banda_larga AS possui_banda_larga,
   *        ir.tp_rede_local AS possui_rede_local
   * FROM escola e
   * JOIN infraestrutura_rede ir ON e.id_infraestrutura_rede = ir.id
   * WHERE e.tp_localizacao = 2
   * AND ir.tp_rede_local = TRUE
   * AND ir.in_banda_larga = FALSE;
   */
  async getEscolasLanSemBandaLarga(): Promise<EscolaLanSemBandaLarga[]> {
    const response = await api.get<EscolaLanSemBandaLarga[]>(
      '/dashboard/escolas-lan-sem-banda-larga'
    );
    return response.data;
  },

  /**
   * CONSULTA 04
   * GET /dashboard/escolas-tablet-sem-lab
   * 
   * Retorna escolas rurais com tablets para alunos mas sem laboratório
   * Deve retornar 2005 resultados conforme especificado
   * 
   * SQL correspondente:
   * SELECT e.no_entidade AS nome_escola,
   *        eq.qt_tablet_aluno AS quantidade_tablets
   * FROM escola e
   * JOIN equipamentos eq ON e.id_equipamentos = eq.id
   * JOIN infraestrutura_geral ig ON e.id_infraestrutura_geral = ig.id
   * WHERE e.tp_localizacao = 2
   * AND eq.in_tablet_aluno = TRUE
   * AND ig.in_laboratorio_informatica = FALSE
   * ORDER BY eq.qt_tablet_aluno DESC;
   */
  async getEscolasTabletSemLab(): Promise<EscolaTabletSemLab[]> {
    const response = await api.get<EscolaTabletSemLab[]>(
      '/dashboard/escolas-tablet-sem-lab'
    );
    return response.data;
  },

  /**
   * ENDPOINT EXTRA (OPCIONAL)
   * GET /dashboard/resumo-geral
   * 
   * Endpoint agregado que pode retornar dados gerais do dashboard
   * em uma única chamada para melhor performance
   */
  async getResumoGeral(): Promise<{
    total_escolas_rurais: number;
    escolas_com_internet: number;
    escolas_com_laboratorio: number;
    escolas_com_tablets: number;
  }> {
    const response = await api.get('/dashboard/resumo-geral');
    return response.data;
  },
};
