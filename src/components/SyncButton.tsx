import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const SyncButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-sync', {
        body: { message: 'Отсинхронь модель' }
      });

      if (error) throw error;

      toast({
        title: "Синхронизация запущена",
        description: "Сообщение отправлено в Telegram",
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Ошибка синхронизации",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-card to-muted rounded-2xl shadow-lg border border-border">
      <div className="mb-6 p-6 rounded-full bg-gradient-to-br from-primary to-accent shadow-glow">
        <RefreshCw className="w-12 h-12 text-primary-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-foreground">Синхронизация модели</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Отправьте команду на синхронизацию Revit модели через Telegram бота
      </p>
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        size="lg"
        className="min-w-[200px] bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300"
      >
        {isSyncing ? (
          <>
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            Синхронизация...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-5 w-5" />
            Синхронизировать
          </>
        )}
      </Button>
    </div>
  );
};
