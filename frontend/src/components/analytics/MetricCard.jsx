import{Card}from'../ui';export default function MetricCard({label,value}){return <Card><small>{label}</small><strong className="metric-value">{value??0}</strong></Card>}
