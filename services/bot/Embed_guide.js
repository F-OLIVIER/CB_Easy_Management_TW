// fichier annexe
import { loadTranslations } from "./language.js";

// Embled DATA
export async function EmbedGuide(Langage) {
  const translate = await loadTranslations(Langage);

  let link1 = "[Le guide des guides / Guide to guides](https://conqblade.com/news/460)";
  let link2 = "[Bien commencer dans le jeu / Getting started in the game](https://conqblade.com/fr/news/538)";

  let linkFR = "Guide et calculateur en Français / French guide and calculator :";
  let linkFR1 = "[Conqueror's Blade - Caracteteristique heros et unites](https://drive.google.com/file/d/1g4vRkolXGbCKJVP3yk95u7AYdMS8yReL)";
  let linkFR2 = "[Conqueror's Blade - Artisanat](https://docs.google.com/spreadsheets/d/1WFi3G6ABFnwbTDQmeW2knrs99g3qF8PPzXpTk2vya6Q)";
  let linkFR3 = "[Guide des Quetes de Fiefs](https://docs.google.com/document/d/1Xu5TTSMOVv3AfecrL5VRPWmy0EQv8NGeFs4KhiPt8yQ )";
  let linkFR4 = "[Guide de craft et ressources ](https://docs.google.com/document/d/19PrHGN2aHaZNeL-gtWR8sXCJEvmypPkNg5eJr2HB8UM)";

  let linkEN = "Guide et calculateur en anglais / English guide and calculator :";
  let linkEN1 = "[Comprehensive Guide to Fief Quests ](http://universalgamersfederation.com/2019/08/16/conquerors-blade-comprehensive-guide-to-fief-quests)";
  let linkEN2 = "[Gathering and Crafting Unit Kits for New Players ](https://www.gaisciochmagazine.com/articles/conquerors_blade__gathering_and_crafting_unit_kits_for_new_players.html)";
  let linkEN3 = "[Zimster's Conquerors Blade Guide ](https://docs.google.com/spreadsheets/d/1C-XPnZuCtYxRaNdjzDSj9kFqngPuZyO4WGVt8agFf5M)";
  let linkEN4 = "[Crafting calculators with kits & materials database](https://docs.google.com/spreadsheets/d/1XHVHVkjGTmhUMBoxscQ-m4MFtKEdpFXn-IFECfZIAVk)";
  let linkEN5 = "[OmniPower's CB Crafting/Gathering Guide](https://docs.google.com/spreadsheets/d/12m_jD9tyVGXX36NXsLdcskv0MpQ5HSaOTkVRP6cB1fA)";
  let linkEN6 = "[How to CB for Tyrants 3](https://docs.google.com/spreadsheets/d/1OJl6h27tB4VAng_SE0sJ4WOhcp257AbQO_ZqsgNrQA0)";
  let linkEN7 = "[Elusiveguides](https://elusiveguides.wixsite.com/home)";
  let linkEN8 = "[denetax.fr](https://denetax.fr/conqueror-blade-tutoriel-mmorpg-fr)";

  const EmbedGuide = {
    color: 0x0099ff,
    title: "**---------------------------------------\n   Conqueror's Blade\n   Liste de guide et calculateur\n   Guide list and calculator\n ---------------------------------------**",
    thumbnail: {
      url: "https://i43.servimg.com/u/f43/15/76/70/95/image-11.png",
    },
    fields: [
      {
        name: "Guide officiel / Official guide :",
        value: "1 - " + link1 + "\n2 - " + link2,
      },
      {
        name: linkFR,
        value: "1 - " + linkFR1 + "\n2 - " + linkFR2 + "\n3 - " + linkFR3 + "\n4 - " + linkFR4,
      },
      {
        name: linkEN,
        value: "1 - " + linkEN1 + "\n2 - " + linkEN2 + "\n3 - " + linkEN3 + "\n4 - " + linkEN4 + "\n5 - " + linkEN5 + "\n6 - " + linkEN6 + "\n7 - " + linkEN7 + "\n8 - " + linkEN8,
      },
    ],
    footer: {
      text: "Des guides a ajouter ? Dite le a votre maitre de guilde\nGuides to add ? Tell your guild master\n",
      icon_url: "https://i43.servimg.com/u/f43/15/76/70/95/_guide10.png",
    },
  };

  return EmbedGuide;
}
