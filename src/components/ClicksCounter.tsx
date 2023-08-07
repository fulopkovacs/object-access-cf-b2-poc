import { api } from "~/utils/api";
import { Button } from "@nextui-org/react";

export function ClicksCounter() {
  const utils = api.useContext();
  const allClicks = api.example.getAllClicks.useQuery();
  const updateTheClicksData = api.example.insertClick.useMutation({
    onSuccess: () => {
      void utils.example.getAllClicks.invalidate();
    },
  });
  return (
    <div>
      <Button
        color={"primary"}
        onClick={() =>
          updateTheClicksData.mutate({ pathname: window.location.pathname })
        }
      >
        Increase the number of clicks by 1
      </Button>
      <ul className="list-inside list-disc">
        {allClicks.data?.map((c) => (
          <li key={c.id}>
            {`"${c.pathname}"`}: {c.numberOfClicks}
          </li>
        ))}
      </ul>
    </div>
  );
}
