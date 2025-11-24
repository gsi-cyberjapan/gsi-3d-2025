import Link from "next/link";
import { Button } from "../ui/button";
import { CircleQuestionMark } from "lucide-react";

export const Help = () => {
  return (
    <Button asChild size="sm" variant="outline">
      <Link href="http://maps.gsi.go.jp/help" target="_blank">
        <CircleQuestionMark /> ヘルプ
      </Link>
    </Button>
  );
};
