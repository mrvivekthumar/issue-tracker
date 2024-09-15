import prisma from "@/prisma/client";
import IssueSummary from "./IssueSummary";
import IssueChart from "./IssueChart";
import { Flex, Grid } from "@radix-ui/themes";
import Latestissues from "./Latestissues";
import { Metadata } from "next";

export default async function Home() {
  const open = await prisma.issue.count({ where: { status: "OPEN" } })
  const closed = await prisma.issue.count({ where: { status: "CLOSED" } })
  const inProgress = await prisma.issue.count({ where: { status: "IN_PROGRESS" } })

  return (
    <Grid columns={{ initial: '1', md: '2' }} gap='6'>
      <Flex direction='column' gap='6'>
        <IssueSummary open={open} closed={closed} inProgress={inProgress} />
        <IssueChart open={open} closed={closed} inProgress={inProgress} />
      </Flex>
      <Latestissues />
    </Grid>
  );
}

export const metadata: Metadata = {
  title: 'Issuse Tracker-Dashboard',
  description: 'View a Summary of Issues'
}
