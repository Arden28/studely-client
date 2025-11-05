import { Outlet } from "react-router-dom";
export default function RunnerLayout() {
  return <div className="min-h-screen bg-background p-4"><Outlet /></div>;
}
