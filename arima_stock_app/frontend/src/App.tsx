
import React, { useState } from 'react'
import axios from 'axios'

export default function App(){
    const [file, setFile] = useState<File | null>(null)
    const [menus, setMenus] = useState<any[]>([])
    const [selected, setSelected] = useState<string[]>([])

    async function upload(){
      if(!file) return alert('pilih file')
      const fd = new FormData()
      fd.append('file', file)
      const res = await axios.post('/upload-sales', fd, {headers:{'Content-Type':'multipart/form-data'}})
      alert('uploaded')
      const menusRes = await axios.get('/menus')
      setMenus(menusRes.data.menus || [])
    }

    async function runForecast(){
      if(selected.length===0) return alert('pilih menu')
      const res = await axios.post('/forecast', {menus: selected, periods:12})
      console.log(res.data)
      alert('forecast done - cek console')
    }

    return (
      <div style={{padding:20}}>
        <h2>ARIMA Planner - Demo</h2>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button onClick={upload}>Upload CSV</button>
        <hr/>
        <h3>Menus</h3>
        <div>
          {menus.map((m:any)=> (
            <label key={m.menu} style={{display:'block'}}><input type="checkbox" value={m.menu} onChange={e=>{
              const v = e.target.value; setSelected(s=> s.includes(v)? s.filter(x=>x!==v): [...s,v])
            }} />{m.menu} ({m.qty})</label>
          ))}
        </div>
        <button onClick={runForecast}>Run Forecast</button>
      </div>
    )
    }
