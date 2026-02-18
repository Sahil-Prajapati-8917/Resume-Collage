import { useEffect, useState } from 'react'
import apiService from '@/services/api'
import { Link } from 'react-router-dom'
import {
  FileText,
  ClipboardList,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Zap,
  Target,
  Users,
  Brain,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Line,
  LineChart,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts'
import ContactMessages from '../../components/dashboard/ContactMessages'

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { name: 'Total Resumes', value: '0', icon: FileText, change: '+0%', trend: 'up', color: 'blue' },
    { name: 'AI Evaluations', value: '0', icon: Brain, change: '+0%', trend: 'up', color: 'purple' },
    { name: 'Avg. Match Score', value: '0%', icon: Target, change: '+0%', trend: 'up', color: 'green' },
    { name: 'Active Openings', value: '0', icon: Users, change: '0%', trend: 'neutral', color: 'orange' },
  ]);
  const [chartData, setChartData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getEmployerDashboardStats();
        if (response.ok) {
          const { data } = await response.json();

          // Update Stats
          setStats([
            { name: 'Total Resumes', value: data.stats.totalResumes.toLocaleString(), icon: FileText, change: '+12%', trend: 'up', color: 'blue' },
            { name: 'AI Evaluations', value: data.stats.totalEvaluations.toLocaleString(), icon: Brain, change: '+18%', trend: 'up', color: 'purple' },
            { name: 'Avg. Match Score', value: `${data.stats.avgMatchScore}%`, icon: Target, change: '+4%', trend: 'up', color: 'green' },
            { name: 'Active Openings', value: data.stats.activeOpenings.toLocaleString(), icon: Users, change: '0%', trend: 'neutral', color: 'orange' },
          ]);

          setChartData(data.chartData);
          setIndustryData(data.industryData);
          setRecentActivity(data.recentActivity);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Intelligence Matrix</h1>
          <p className="text-muted-foreground font-medium">Real-time analytics for your AI-driven recruitment engine.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 bg-card/40 border-border/40 font-bold">
            <Zap className="size-4 mr-2 text-primary" /> System Health
          </Button>
          <Button asChild className="h-10 shadow-lg shadow-primary/20 font-bold">
            <Link to="/upload">Process Resumes</Link>
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="group border-border/40 bg-card/50 transition-all hover:bg-card hover:border-primary/30 relative overflow-hidden">
            <div className={`absolute top-0 right-0 size-24 blur-3xl -mr-12 -mt-12 opacity-10 transition-opacity group-hover:opacity-20 bg-${stat.color}-500`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={`h-4 px-1.5 text-[9px] font-black uppercase ${stat.trend === 'up' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {stat.change}
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">vs Period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Flow Chart */}
        <Card className="lg:col-span-8 border-border/40 bg-card/50 relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold tracking-tight">Recruitment Velocity</CardTitle>
              <CardDescription className="text-xs font-medium">Evaluation throughput and AI accuracy drift over time.</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase text-muted-foreground">Volume</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-primary/30" />
                <span className="text-[10px] font-black uppercase text-muted-foreground">Accuracy</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEval" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    fontFamily="Inter"
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                    labelStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="evaluations"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorEval)"
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="var(--primary)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sector Analytics */}
        <Card className="lg:col-span-4 border-border/40 bg-card/50">
          <CardHeader className="pb-8">
            <CardTitle className="text-lg font-bold tracking-tight text-center">Sector Distribution</CardTitle>
            <CardDescription className="text-xs font-medium text-center">Evaluations segmented by job vertical.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={industryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    fontFamily="Inter"
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="absolute inset-x-0 bottom-0 py-4 px-6 flex flex-wrap justify-center gap-4 border-t border-border/20">
                {industryData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] font-black uppercase text-muted-foreground">{Math.round((d.value / 120) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Operations */}
        <Card className="lg:col-span-8 border-border/40 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold tracking-tight">Intelligence Logs</CardTitle>
              <CardDescription className="text-xs font-medium">Stream of recent AI analysis outcomes.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest h-8" asChild>
              <Link to="/history">Expand Log <ArrowUpRight className="ml-1.5 size-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentActivity.map((item) => (
              <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-none">{item.candidate}</p>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase opacity-60 mt-1">{item.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${item.score >= 80 ? 'text-green-500' : 'text-orange-500'}`}>{item.score}%</span>
                      <Badge variant="outline" className="h-5 text-[9px] font-black uppercase border-border/40 bg-background/50">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase opacity-40 w-16 justify-end">
                    <Clock className="mr-1 size-3" />
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Neural Engine Stat */}
        <Card className="lg:col-span-4 border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
          <div className="absolute top-0 right-0 size-64 bg-white/20 blur-3xl rounded-full -mr-32 -mt-32" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="size-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/30 shadow-2xl">
              <TrendingUp className="size-8" />
            </div>
            <h3 className="font-black text-2xl tracking-tighter leading-tight">Neural Performance Optimized</h3>
            <p className="text-sm text-primary-foreground/80 mt-3 max-w-[240px] font-medium leading-relaxed">
              System throughput has integrated with the new evaluation protocols, increasing precision by <span className="underline font-black">12.4%</span> this cycle.
            </p>
            <Button variant="secondary" className="mt-8 w-full bg-white text-primary hover:bg-white/90 font-black tracking-tight" asChild>
              <Link to="/upload">Initialize New Analysis</Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Contact Messages Section */}
      <div className="grid grid-cols-1 gap-4">
        <ContactMessages />
      </div>
    </div>
  )
}

export default Dashboard


