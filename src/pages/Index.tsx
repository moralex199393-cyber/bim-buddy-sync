import { SyncButton } from "@/components/SyncButton";
import { AIChat } from "@/components/AIChat";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Revit BIM Assistant
          </h1>
          <p className="text-xl text-muted-foreground">
            Управление синхронизацией и консультации с AI BIM-менеджером
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <SyncButton />
          </div>

          <div className="lg:col-span-1 h-[600px]">
            <AIChat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
