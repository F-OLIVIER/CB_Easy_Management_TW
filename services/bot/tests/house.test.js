import { config_house_db } from "../config_house.js";
import { db_test } from "./main.test.js";

test("config_house_db crée une nouvelle maison quand ID = 0", async () => {
  let houseData = {
    House_name: "Maison Test",
    House_logo: "pas de logo",
    Langage: "fr",
    ID_Server: "test ID_Server",
    ID_Group_Users: "test ID_Group_Users",
    ID_Group_Officier: "test ID_Group_Officier",
    ID_Chan_GvG: "test ID_Chan_GvG",
    ID_Chan_Gestion: "test ID_Chan_Gestion",
    ID_Chan_Users: "test ID_Chan_Users",
    Recall_GvG: 1,
    ID_MessageGvG: "test ID_MessageGvG",
  };

  // Création d'une maison
  await config_house_db(houseData, 0);

  const resultCreate = await db_test.get(`SELECT * FROM Houses WHERE ID = 1`);

  expect(resultCreate).toBeDefined();
  expect(resultCreate.House_name).toBe("Maison Test");
  expect(resultCreate.Langage).toBe("fr");
  expect(resultCreate.ID_Server).toBe("test ID_Server");
  expect(resultCreate.ID_Group_Users).toBe("test ID_Group_Users");
  expect(resultCreate.ID_Group_Officier).toBe("test ID_Group_Officier");
  expect(resultCreate.ID_Chan_GvG).toBe("test ID_Chan_GvG");
  expect(resultCreate.ID_Chan_Gestion).toBe("test ID_Chan_Gestion");
  expect(resultCreate.ID_Chan_Users).toBe("test ID_Chan_Users");
  expect(resultCreate.ID_MessageGvG).toBe("test ID_MessageGvG");


  // Mise à jour d'une maison
  houseData.House_name = "nom de maison mis a jour"
  houseData.Langage = "en"
  houseData.ID_MessageGvG = "ID_MessageGvG changer"

  await config_house_db(houseData, 1);

  const resultUpdate = await db.get(`SELECT * FROM Houses WHERE ID = 1`);
  expect(resultUpdate).toBeDefined();
  expect(resultUpdate.House_name).toBe("nom de maison mis a jour");
  expect(resultCreate.Langage).toBe("en");
  expect(resultUpdate.ID_MessageGvG).toBe("ID_MessageGvG changer");
});
