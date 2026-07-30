import StrategyClient from "@/components/StrategyClient";

export default function StrategyPage() {
  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Agent Strategy</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tune your agent's decision-making personality. Changes apply starting next waiver cycle.
        </p>
      </div>
      <StrategyClient />
    </div>
  );
}
