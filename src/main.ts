import { Args, getTasks } from "grimoire-kolmafia";
import { myAdventures } from "kolmafia";
import { effectResources } from "./effects";
import { Engine } from "./engine/engine";
import { setupPotions } from "./potions";
import { BaggoQuest } from "./tasks";

export const args = Args.create("baggo", "A script for farming duffel bags and van keys.", {
  advs: Args.number({
    help: "Number of adventures to spend farming. Defaults to your current number of adventures.",
    default: myAdventures(),
  }),
  itemvalue: Args.number({ help: "Value of a single duffel bag or van key.", default: 20_000 }),
  olfact: Args.string({
    help: "Which monster to olfact.",
    options: [
      ["none", ""],
      ["burnout", "Drops van key (food)."],
      ["jock", "Drops duffel bag (booze)."],
    ],
    default: "none",
  }),
});

export const initialAdvs = myAdventures();

export function turnsRemaining(): number {
  return args.advs - (initialAdvs - myAdventures());
}

export function main(command?: string): void {
  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }

  const tasks = getTasks([BaggoQuest]);
  const engine = new Engine(tasks);

  if (engine.getNextTask()) {
    setupPotions();
    for (const resource of effectResources) {
      if (resource.available()) {
        resource.prepare?.();
        resource.do();
      }
    }
  }

  try {
    engine.run();
  } finally {
    engine.destruct();
  }
}
