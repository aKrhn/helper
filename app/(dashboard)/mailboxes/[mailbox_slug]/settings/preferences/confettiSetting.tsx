"use client";

import { useState } from "react";
import { triggerConfetti } from "@/components/confetti";
import { SavingIndicator } from "@/components/savingIndicator";
import { Button } from "@/components/ui/button";
import { useSettingsMutation } from "@/lib/hooks/useSettingsMutation";
import { RouterOutputs } from "@/trpc";
import { api } from "@/trpc/react";
import { SwitchSectionWrapper } from "../sectionWrapper";

const ConfettiSetting = ({ mailbox }: { mailbox: RouterOutputs["mailbox"]["get"] }) => {
  const [confettiEnabled, setConfettiEnabled] = useState(mailbox.preferences?.confetti ?? false);

  const utils = api.useUtils();

  const { save: update, savingIndicator } = useSettingsMutation({
    mutationFn: api.mailbox.update.useMutation,
    errorTitle: "Error updating preferences",
    invalidateQueries: [{ query: utils.mailbox.get, params: { mailboxSlug: mailbox.slug } }],
  });

  const handleSwitchChange = (checked: boolean) => {
    setConfettiEnabled(checked);
    update({ mailboxSlug: mailbox.slug, preferences: { confetti: checked } });
  };

  const handleTestConfetti = () => {
    triggerConfetti();
  };

  return (
    <div className="relative">
      <div className="absolute top-2 right-4 z-10">
        <SavingIndicator state={savingIndicator.state} />
      </div>
      <SwitchSectionWrapper
        title="Confetti Settings"
        description="Enable full-page confetti animation when closing a ticket"
        initialSwitchChecked={confettiEnabled}
        onSwitchChange={handleSwitchChange}
      >
        {confettiEnabled && <Button onClick={handleTestConfetti}>Test Confetti</Button>}
      </SwitchSectionWrapper>
    </div>
  );
};

export default ConfettiSetting;
