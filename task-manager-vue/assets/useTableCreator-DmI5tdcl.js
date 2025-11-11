const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-BLkw5pkK.js","assets/index-DC9hwl3r.css"])))=>i.map(i=>d[i]);
import{u as x,_ as l,a as f}from"./index-BLkw5pkK.js";function C(){const{createServiceClient:E,url:T}=f(),{loadConfig:p}=x(),S=async(r,i)=>{var n,a,e;try{const o=E(r),{data:s,error:t}=await o.rpc("exec_ddl",{sql_text:"SELECT 1;"});return t?(console.log("exec_ddl 函数检查错误:",t),t.code==="42883"||t.code==="P0001"||((n=t.message)==null?void 0:n.toLowerCase().includes("function"))||((a=t.message)==null?void 0:a.toLowerCase().includes("does not exist"))||((e=t.message)==null?void 0:e.toLowerCase().includes("不存在"))?(console.log("exec_ddl 函数不存在"),!1):(console.warn("exec_ddl 函数检查时出现其他错误:",t),!1)):(console.log("exec_ddl 函数存在，检查通过"),!0)}catch(o){return console.error("检查 exec_ddl 函数异常:",o),!1}},y=async(r="tableStatus")=>{const i=p();let n=(i==null?void 0:i.serviceKey)||"";if(!n){const e=document.getElementById("settingsServiceKey");e&&(n=e.value.trim(),r="settingsStatus")}if(!n){const{useStatus:e}=await l(async()=>{const{useStatus:s}=await import("./index-BLkw5pkK.js").then(t=>t.b);return{useStatus:s}},__vite__mapDeps([0,1])),{showStatus:o}=e(r);o("⚠️ 请先在设置页面填写 Service Role Key","warning");return}const a=T.value||(i==null?void 0:i.url)||"";if(!a){const{useStatus:e}=await l(async()=>{const{useStatus:s}=await import("./index-BLkw5pkK.js").then(t=>t.b);return{useStatus:s}},__vite__mapDeps([0,1])),{showStatus:o}=e(r);o("⚠️ 请先配置 Supabase URL 和 Service Role Key","error");return}try{if(!await S(n,a)){w(r,n,a);return}await m(n,a,r)}catch(e){console.error("创建任务表失败:",e);const{useStatus:o}=await l(async()=>{const{useStatus:t}=await import("./index-BLkw5pkK.js").then(c=>c.b);return{useStatus:t}},__vite__mapDeps([0,1])),{showStatus:s}=o(r);s(`❌ 创建任务表失败: ${e.message}`,"error")}},w=(r,i,n)=>{const a=`CREATE OR REPLACE FUNCTION exec_ddl(sql_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE sql_text;
END;
$$;`,e=document.getElementById(r);if(!e)return;const o="create-function-"+Date.now();e.innerHTML=`
      <div class="status info">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong>⚠️ 需要先创建 exec_ddl 函数（只需执行一次）：</strong>
          <button class="btn btn-sm" onclick="window.copySQL('${o}')">📋 复制 SQL</button>
        </div>
        <pre id="${o}" style="background: var(--light-bg); padding: 15px; border-radius: 5px; font-family: monospace; font-size: 0.9em; white-space: pre-wrap;">${a}</pre>
        <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 10px;">
          请在 Supabase Dashboard → SQL Editor 中手动执行上述 SQL，然后再次点击"创建任务表"按钮
        </div>
      </div>
    `,window.currentSQL=a,window.copySQL=async s=>{var d;const{copyToClipboard:t}=await l(async()=>{const{copyToClipboard:_}=await import("./index-BLkw5pkK.js").then(u=>u.b);return{copyToClipboard:_}},__vite__mapDeps([0,1])),c=window.currentSQL||((d=document.getElementById(s))==null?void 0:d.textContent);if(c&&await t(c)){const u=document.querySelector(`button[onclick*="${s}"]`);if(u){const g=u.textContent;u.textContent="✅ 已复制",u.style.background="#28a745",setTimeout(()=>{u.textContent=g,u.style.background=""},2e3)}}}},m=async(r,i,n)=>{const{useStatus:a}=await l(async()=>{const{useStatus:s}=await import("./index-BLkw5pkK.js").then(t=>t.b);return{useStatus:s}},__vite__mapDeps([0,1])),{showStatus:e}=a(n);e("⏳ 正在创建任务表...","info");const o=[`CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)`,"CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON daily_tasks(status)","CREATE INDEX IF NOT EXISTS idx_daily_tasks_due_date ON daily_tasks(due_date)","CREATE INDEX IF NOT EXISTS idx_daily_tasks_created_at ON daily_tasks(created_at)","COMMENT ON TABLE daily_tasks IS '每日任务表'"];try{const s=E(r);e("⏳ 正在创建表结构...","info");const{error:t}=await s.rpc("exec_ddl",{sql_text:o[0]});if(t){console.error("创建表失败:",t),e(`❌ 创建表失败: ${t.message||t.code||JSON.stringify(t)}`,"error");return}e("⏳ 正在创建索引和注释...","info");for(let c=1;c<o.length;c++)try{const{error:d}=await s.rpc("exec_ddl",{sql_text:o[c]});d&&console.warn(`执行语句 ${c} 失败:`,d)}catch(d){console.warn(`执行语句 ${c} 异常:`,d)}e("✅ 任务表创建成功！","success"),setTimeout(()=>{window.dispatchEvent(new CustomEvent("refresh-tasks"))},1e3)}catch(s){console.error("创建任务表异常:",s),e(`❌ 创建表失败: ${s.message||JSON.stringify(s)}`,"error")}};return{createTasksTable:y}}export{C as useTableCreator};
