"use client";

import { useState } from "react";
import { toast } from "@/components/hooks/use-toast";
import { SavingIndicator } from "@/components/savingIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDebouncedCallback } from "@/components/useDebouncedCallback";
import { useOnChange } from "@/components/useOnChange";
import { useMutationWithToast } from "@/lib/hooks/useMutationWithToast";
import { useSettingsMutation } from "@/lib/hooks/useSettingsMutation";
import { RouterOutputs } from "@/trpc";
import { api } from "@/trpc/react";
import SectionWrapper from "../sectionWrapper";

type AutoCloseUpdates = {
  autoCloseEnabled: boolean;
  autoCloseDaysOfInactivity: number;
};

export default function AutoCloseSetting({ mailbox }: { mailbox: RouterOutputs["mailbox"]["get"] }) {
  const [isEnabled, setIsEnabled] = useState(mailbox.autoCloseEnabled);
  const [daysOfInactivity, setDaysOfInactivity] = useState(mailbox.autoCloseDaysOfInactivity?.toString() ?? "30");

  const utils = api.useUtils();

  const { save: update, savingIndicator } = useSettingsMutation({
    mutationFn: api.mailbox.update.useMutation,
    errorTitle: "Error updating auto-close settings",
    invalidateQueries: [{ query: utils.mailbox.get, params: { mailboxSlug: mailbox.slug } }],
  });

  const save = useDebouncedCallback(() => {
    update({
      mailboxSlug: mailbox.slug,
      autoCloseEnabled: isEnabled,
      autoCloseDaysOfInactivity: Number(daysOfInactivity),
    });
  }, 500);

  useOnChange(() => {
    save();
  }, [isEnabled, daysOfInactivity]);

  const { mutate: runAutoClose, isPending: isAutoClosePending } = useMutationWithToast({
    mutationFn: api.mailbox.autoClose.useMutation,
    onSuccess: {
      message: "The auto-close job has been triggered successfully.",
    },
    onError: {
      fallbackMessage: "running auto-close",
    },
  });

  return (
    <div className="relative">
      <div className="absolute top-2 right-4 z-10">
        <SavingIndicator state={savingIndicator.state} />
      </div>
      <SectionWrapper
        title="Auto-close Inactive Tickets"
        description="Automatically close tickets that have been inactive for a specified period of time."
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-close-toggle">Enable auto-close</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, tickets with no activity will be automatically closed.
              </p>
            </div>
            <Switch id="auto-close-toggle" checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>

          {isEnabled && (
            <div className="space-y-2">
              <Label htmlFor="days-of-inactivity">Days of inactivity before auto-close</Label>
              <div className="flex items-center gap-2 w-fit">
                <Input
                  id="days-of-inactivity"
                  type="number"
                  min="1"
                  value={daysOfInactivity}
                  onChange={(e) => setDaysOfInactivity(e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">{daysOfInactivity === "1" ? "day" : "days"}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tickets with no activity for this many days will be automatically closed.
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outlined"
              onClick={() => runAutoClose({ mailboxSlug: mailbox.slug })}
              disabled={!isEnabled || isAutoClosePending}
            >
              {isAutoClosePending ? "Running..." : "Run auto-close now"}
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
