import PackingItem from './PackingItem'
export default function PackingChecklist({items,...handlers}){return <div className="packing-list">{items.map(item=><PackingItem key={item.id} item={item} onToggle={()=>handlers.onToggle(item)} onEdit={()=>handlers.onEdit(item)} onDelete={()=>handlers.onDelete(item)}/>)}</div>}
