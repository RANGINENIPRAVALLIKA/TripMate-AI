import client,{apiData}from'../api/client';export const adminService={dashboard:()=>apiData(client.get('/admin/dashboard'))}
