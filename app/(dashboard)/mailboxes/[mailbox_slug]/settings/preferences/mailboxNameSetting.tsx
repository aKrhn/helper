"use client";

import { useState } from "react";
import { SavingIndicator } from "@/components/savingIndicator";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/components/useDebouncedCallback";
import { useOnChange } from "@/components/useOnChange";
import { useSettingsMutation } from "@/lib/hooks/useSettingsMutation";
import { RouterOutputs } from "@/trpc";
import { api } from "@/trpc/react";
import SectionWrapper from "../sectionWrapper";

const MailboxNameSetting = ({ mailbox }: { mailbox: RouterOutputs["mailbox"]["get"] }) => {
  const [name, setName] = useState(mailbox.name);

  const utils = api.useUtils();

  const { save: update, savingIndicator } = useSettingsMutation({
    mutationFn: api.mailbox.update.useMutation,
    errorTitle: "Error updating preferences",
    invalidateQueries: [{ query: utils.mailbox.get, params: { mailboxSlug: mailbox.slug } }],
  });

  const save = useDebouncedCallback(() => {
    update({ mailboxSlug: mailbox.slug, name });
  }, 500);

  useOnChange(() => {
    save();
  }, [name]);

  return (
    <div className="relative">
      <div className="absolute top-2 right-4 z-10">
        <SavingIndicator state={savingIndicator.state} />
      </div>
      <SectionWrapper title="Mailbox name" description="Change the name of your mailbox">
        <div className="max-w-sm">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter mailbox name" />
        </div>
      </SectionWrapper>
    </div>
  );
};

export default MailboxNameSetting;
