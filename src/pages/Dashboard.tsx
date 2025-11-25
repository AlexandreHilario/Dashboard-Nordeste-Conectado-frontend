import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { School, Monitor, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactECharts from 'echarts-for-react';
import api from '@/services/api';

const Dashboard = () => {
  // ==== ESTADOS DOS CARDS ====
  const [totalNordeste, setTotalNordeste] = useState<number | null>(null);
  const [totalRural, setTotalRural] = useState<number | null>(null);
  const [labInternet, setLabInternet] = useState<number | null>(null);
  const [mediaComputadores, setMediaComputadores] = useState<number | null>(null);

  // ==== ESTADOS GRÁFICOS ====
  const [barData, setBarData] = useState<number[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [listaEscolas, setListaEscolas] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // =====================
  // CHAMADAS PARA OS CARDS
  // =====================
  useEffect(() => {
    async function carregarCards() {
      try {
        const [
          totalNordesteRes,
          totalRuralRes,
          labInternetRes,
          mediaComputadoresRes,
        ] = await Promise.all([
          api.get("/metrics/total-escolas-nordeste"),
          api.get("/metrics/total-escolas-nordeste-rural"),
          api.get("/metrics/escolas-rurais-lab-internet"),
          api.get("/metrics/media-computadores-aluno"),
        ]);

        setTotalNordeste(totalNordesteRes.data.total_escolas_nordeste);
        setTotalRural(totalRuralRes.data.total_escolas_nordeste);
        setLabInternet(labInternetRes.data.escolas_rurais_com_lab_e_internet);
        setMediaComputadores(mediaComputadoresRes.data.media_computadores_por_aluno);

      } catch (error) {
        console.error("Erro ao carregar cards:", error);
      }
    }

    carregarCards();
  }, []);

  // =====================
  // GRÁFICO DE BARRAS
  // =====================
  useEffect(() => {
    async function carregarBarras() {
      try {
        const r = await api.get("/metrics/detalhes-internet-bandaLarga");

        setBarData([
          r.data.rurais_com_rede_local_sem_banda_larga,
          r.data.rurais_com_rede_local,
          r.data.rurais_sem_banda_larga,
        ]);

      } catch (error) {
        console.error("Erro gráfico barras:", error);
      }
    }

    carregarBarras();
  }, []);


  // =====================
  // GRÁFICO DE PIZZA
  // =====================
  useEffect(() => {
    async function carregarPizza() {
      try {
        const [totalNE, totalRural] = await Promise.all([
          api.get("/metrics/total-escolas-nordeste"),
          api.get("/metrics/total-escolas-nordeste-rural"),
        ]);

        setPieData([
          { value: totalNE.data.total_escolas_nordeste, name: "Total Nordeste" },
          { value: totalRural.data.total_escolas_nordeste, name: "Rurais Nordeste" }
        ]);

      } catch (error) {
        console.error("Erro gráfico pizza:", error);
      }
    }

    carregarPizza();
  }, []);

  // =====================
  // LISTA DE ESCOLAS
  // =====================
  useEffect(() => {
    async function carregarLista() {
      try {
        const res = await api.get("/metrics/lista-escola");
        setListaEscolas(res.data);
      } catch (error) {
        console.error("Erro lista escolas:", error);
      } finally {
        setIsLoading(false);
      }
    }

    carregarLista();
  }, []);

  // =====================
  // CONFIG BARRA
  // =====================
  const barChartConfig = {
    xAxis: {
      type: "category",
      data: [
        "Rede Local S/ Banda",
        "Rede Local",
        "Sem Banda Larga"
      ]
    },
    yAxis: { type: "value" },
    series: [
      {
        data: barData,
        type: "bar",
        itemStyle: { color: "#3b82f6" }
      }
    ]
  };

  // =====================
  // CONFIG PIZZA
  // =====================
  const pieChartConfig = {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: "65%",
        data: pieData
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container py-6 px-6 space-y-6">

        {/* CARDS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <StatsCard
            title="Total de Escolas Nordeste"
            value={totalNordeste?.toLocaleString("pt-BR")}
            description="Todas as escolas da região"
            icon={Building2}
          />

          <StatsCard
            title="Escolas Área Rural"
            value={totalRural?.toLocaleString("pt-BR")}
            description="Escolas da zona rural"
            icon={MapPin}
          />

          <StatsCard
            title="Rurais com Lab + Internet"
            value={labInternet?.toLocaleString("pt-BR")}
            description="Laboratório + Internet"
            icon={School}
          />

          <StatsCard
            title="Computadores por Aluno"
            value={mediaComputadores}
            description="Média da zona rural"
            icon={Monitor}
          />
        </div>

        {/* GRÁFICOS */}
        <div className="grid gap-4 md:grid-cols-2">

          <Card>
            <CardHeader>
              <CardTitle>Infraestrutura Total – Rede no Nordeste</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactECharts option={barChartConfig} style={{ height: '300px' }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição – Nordeste</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactECharts option={pieChartConfig} style={{ height: '300px' }} />
            </CardContent>
          </Card>

        </div>

        {/* TABELA */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Escolas</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border max-h-80 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Nome</th>
                    <th className="text-left p-4 font-medium">Internet</th>
                    <th className="text-left p-4 font-medium">Laboratório</th>
                  </tr>
                </thead>

                <tbody>
                  {listaEscolas.map((escola, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4">{escola.nome_escola}</td>
                      <td className="p-4">{escola.possui_internet ? "Sim" : "Não"}</td>
                      <td className="p-4">{escola.possui_laboratorio ? "Sim" : "Não"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default Dashboard;
