import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { campaigns } from "@/lib/mock-data";

import { CampaignsTable } from "./_components/campaigns-table";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-medium tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground text-sm">Manage and track your email marketing campaigns.</p>
        </div>
        <Button>
          <Plus />
          Create New Campaign
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>
      </Tabs>

      <CampaignsTable data={campaigns} />
    </div>
  );
}
