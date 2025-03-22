// Import
import 'dart:convert';
import 'package:flutter/material.dart';

// Fichers annexes
import 'package:easy_management_tw/common_custom_app.dart';
import 'package:easy_management_tw/config.dart';
import 'package:easy_management_tw/fetch_server.dart';
import 'package:easy_management_tw/notification.dart';

class Caserne extends StatefulWidget {
  const Caserne({super.key});

  @override
  Casernepage createState() => Casernepage();
}

class Casernepage extends State<Caserne> {
  Map<String, List<dynamic>> unitsByType = {};
  List<Map<String, dynamic>> allUnits = [];
  ValueNotifier<bool> isButtonVisible = ValueNotifier<bool>(false);
  List<Tab> tabs = [];

  void addUnitLevel(
    List<Map<String, dynamic>> allUnits,
    Map<String, dynamic> unit,
  ) {
    // Affichage du boutton
    if (isButtonVisible.value == false) {
      isButtonVisible.value = true;
    }

    // Vérifier si l'Unit_id existe déjà dans allUnits
    bool exists = allUnits.any(
      (existingUnit) => existingUnit['Unit_id'] == unit['Unit_id'],
    );

    if (!exists) {
      // Si l'Unit_id n'existe pas encore, l'ajouter avec son niveau (Unit_lvl)
      allUnits.add({
        'Unit_id': unit['Unit_id'].toString(),
        'Unit_lvl': unit['Unit_lvl'].toString(),
      });
    } else {
      // Si l'Unit_id existe, mettre à jour Unit_lvl avec la nouvelle valeur
      for (var existingUnit in allUnits) {
        if (existingUnit['Unit_id'] == unit['Unit_id']) {
          existingUnit['Unit_lvl'] = unit['Unit_lvl'] ?? 0;
          break;
        }
      }
    }
  }

  void addUnitMaitrise(
    List<Map<String, dynamic>> allUnits,
    Map<String, dynamic> unit,
  ) {
    // Affichage du boutton
    if (isButtonVisible.value == false) {
      isButtonVisible.value = true;
    }

    // Vérifier si l'Unit_id existe déjà dans allUnits
    bool exists = allUnits.any(
      (existingUnit) => existingUnit['Unit_id'] == unit['Unit_id'],
    );

    if (!exists) {
      // Si l'Unit_id n'existe pas encore, l'ajouter avec sa maîtrise (UserMaitrise)
      allUnits.add({
        'Unit_id': unit['Unit_id'].toString(),
        'UserMaitrise': unit['UserMaitrise'].toString(),
      });
    } else {
      // Si l'Unit_id existe, mettre à jour UserMaitrise avec la nouvelle valeur
      for (var existingUnit in allUnits) {
        if (existingUnit['Unit_id'] == unit['Unit_id']) {
          existingUnit['UserMaitrise'] = unit['UserMaitrise'] ?? 0;
          break;
        }
      }
    }
  }

  Future<void> sendinfoserver(BuildContext context) async {
    // Vérifier si allUnits est null ou vide
    if (allUnits.isEmpty) {
      // Aucun changement à valider
      showErrorNotification(
        context,
        Config.language == "fr"
            ? "Aucun changement à valider !!!"
            : "No changes to validate !!!",
      );
      return;
    }

    // Préparer les données à envoyer
    Map<String, dynamic> dataToSend = {
      'iduser': Config.codeApp,
      'listNewAppUnitCaserne': allUnits,
    };

    // Envoyer les données au serveur
    sendDataToServer(adresstosend: 'updatecaserne', data: dataToSend)
        .then((success) {
          if (success) {
            // Afficher une notification de succès
            if (context.mounted) {
              showSuccessNotification(
                context,
                Config.language == "fr"
                    ? "Changements validés avec succès !"
                    : "Changes successfully validated!",
              );
            }

            if (context.mounted) {
              Navigator.pushNamed(context, '/caserne');
            }
          } else {
            // Afficher une notification d'échec
            if (context.mounted) {
              showErrorNotification(
                context,
                Config.language == "fr"
                    ? "Erreur interne, contactez un administrateur"
                    : "Internal error, contact an administrator",
              );
            }
          }
        })
        .catchError((e) {
          if (context.mounted) {
            showErrorNotification(
              context,
              Config.language == "fr"
                  ? "Une erreur est survenue, veuillez réessayer."
                  : "An error has occurred, please try again.",
            );
          }
        });
  }

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      var data = await fetchData(tofetch: 'caserne');

      // print(
      //   '\n------------------------------------------\nData receive :\n$data\n------------------------------------------\n',
      // );

      if (data['Internet'] != null && data['Internet'] == false) {
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/no_internet');
        }
        return;
      }

      if (data['Gestion']['Logged'] == false && mounted) {
        await logout(context);
        return;
      }

      if (data['ListUnit'] != null) {
        _processUnits(data['ListUnit']);
      }
    } catch (error) {
      // print('Erreur lors du chargement des données: $error');
    }
  }

  void _processUnits(List<dynamic> unitData) {
    List<Map<String, dynamic>> units = List<Map<String, dynamic>>.from(
      unitData,
    );

    // Définition de l'ordre personnalisé
    Map<String, Map<String, int>> typeOrder = {
      "fr": {"Infanterie": 0, "Distant": 1, "Cavalerie": 2},
      "en": {"Infantry": 0, "Distant": 1, "Cavalry": 2},
    };

    // Tri des unités par type (selon notre ordre) puis par tier (du plus grand au plus petit)
    units.sort((a, b) {
      String language = Config.language;
      Map<String, int> orderMap = typeOrder[language] ?? typeOrder["en"]!;

      String aType = a['Unit_type'][language] ?? a['Unit_type']['en'];
      String bType = b['Unit_type'][language] ?? b['Unit_type']['en'];

      int aOrder = orderMap[aType] ?? 99;
      int bOrder = orderMap[bType] ?? 99;

      int typeComparison = aOrder - bOrder;

      return typeComparison != 0
          ? typeComparison
          : b['Unit_tier'].compareTo(a['Unit_tier']);
    });

    // Regroupement par type
    Map<String, List<Map<String, dynamic>>> tempUnitsByType = {};
    for (var unit in units) {
      String unitType =
          unit['Unit_type'][Config.language] ?? unit['Unit_type']['en'];

      tempUnitsByType.putIfAbsent(unitType, () => []).add(unit);
    }

    // Mise à jour de l'état
    if (mounted) {
      setState(() {
        unitsByType = tempUnitsByType;
        tabs = unitsByType.keys.map((type) => Tab(text: type)).toList();
      });
    }
  }

  @override
  void dispose() {
    isButtonVisible.dispose(); // Libération de la mémoire
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: customAppBar(
        context,
        title: Config.language == "fr" ? "Caserne" : "Barrack",
      ),
      drawer: customAppDrawer(context),
      backgroundColor: Color.fromARGB(255, 115, 147, 214),
      body: Center(
        child:
            (tabs.isEmpty)
                ? CircularProgressIndicator()
                : DefaultTabController(
                  length: tabs.length,
                  child: Column(
                    children: [
                      // Affichage conditionnel du bouton de validation
                      ValueListenableBuilder<bool>(
                        valueListenable: isButtonVisible,
                        builder: (context, value, child) {
                          return value
                              ? Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 0,
                                      horizontal: 20,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(30),
                                    ),
                                    elevation: 0,
                                    backgroundColor: Colors.transparent,
                                    shadowColor: Colors.transparent,
                                  ),
                                  onPressed:
                                      () async => await sendinfoserver(context),
                                  child: Ink(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          Colors.blue.shade400,
                                          Colors.blue.shade900,
                                        ],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
                                      borderRadius: BorderRadius.circular(30),
                                    ),
                                    child: Container(
                                      alignment: Alignment.center,
                                      constraints: const BoxConstraints(
                                        minWidth: 150,
                                        minHeight: 50,
                                      ),
                                      child: Text(
                                        Config.language == "fr"
                                            ? "Valider les changements"
                                            : "Submit changes",
                                        // 'Valider les changements',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              )
                              : SizedBox.shrink();
                        },
                      ),
                      // Onglets
                      TabBar(
                        tabs: tabs,
                        indicator: BoxDecoration(
                          color: Color.fromARGB(255, 254, 244, 195),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        indicatorPadding: EdgeInsets.symmetric(
                          horizontal: -10.0,
                          vertical: 0.0,
                        ),
                        labelColor: Colors.black,
                        unselectedLabelColor: Colors.white,
                      ),
                      Expanded(
                        child: TabBarView(
                          children:
                              tabs.map((tab) {
                                String type = tab.text ?? '';
                                List unitsForType = unitsByType[type] ?? [];
                                return ListView.builder(
                                  itemCount: unitsForType.length,
                                  itemBuilder: (context, index) {
                                    var unit = unitsForType[index];

                                    // Conversion des champs en int
                                    int unitMaitrise =
                                        int.tryParse(
                                          unit['Unit_maitrise'] ?? '0',
                                        ) ??
                                        0;
                                    int userMaitrise =
                                        int.tryParse(
                                          unit['UserMaitrise'] ?? '0',
                                        ) ??
                                        0;
                                    int unitLvl =
                                        int.tryParse(unit['Unit_lvl'] ?? '0') ??
                                        0;
                                    int unitLvlMax =
                                        int.tryParse(
                                          unit['Unit_lvlMax'] ?? '1',
                                        ) ??
                                        1;
                                    String imagePath = unit['Unit_img'] ?? '';
                                    String imageUrl =
                                        '${Config.imgUrl}${imagePath.startsWith('./') ? imagePath.replaceFirst('.', '') : imagePath}';
                                    String unitName =
                                        '${utf8.decode(unit['Unit_name'][Config.language].runes.toList())} (${unit['Unit_tier']})';

                                    return Card(
                                      elevation: 4,
                                      margin: EdgeInsets.all(16),
                                      child: Padding(
                                        padding: EdgeInsets.all(12),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.center,
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            // Nom de l'unité
                                            Center(
                                              child: Text(
                                                unitName,
                                                style: TextStyle(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                            SizedBox(height: 10),

                                            // Image et sélection de niveau
                                            Row(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                // Image de l'unité
                                                Container(
                                                  width: 80,
                                                  height: 120,
                                                  decoration: BoxDecoration(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          8,
                                                        ),
                                                    image: DecorationImage(
                                                      image: NetworkImage(
                                                        imageUrl,
                                                      ),
                                                      fit: BoxFit.cover,
                                                    ),
                                                  ),
                                                ),
                                                SizedBox(width: 10),

                                                // Sélection du niveau et de la maîtrise
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      // Dropdown pour le niveau
                                                      DropdownButtonFormField<
                                                        int
                                                      >(
                                                        decoration: InputDecoration(
                                                          labelText: '',
                                                          border:
                                                              OutlineInputBorder(),
                                                          filled: true,
                                                          fillColor:
                                                              allUnits.any(
                                                                    (
                                                                      existingUnit,
                                                                    ) =>
                                                                        existingUnit['Unit_id'] ==
                                                                            unit['Unit_id'] &&
                                                                        existingUnit['Unit_lvl'] !=
                                                                            null,
                                                                  )
                                                                  // Valeur changer
                                                                  ? Colors
                                                                      .blue
                                                                      .shade100
                                                                  : (unitLvl ==
                                                                      0)
                                                                  // Non débloquer
                                                                  ? Colors.red
                                                                  : (unitLvl ==
                                                                      unitLvlMax)
                                                                  // lvl max
                                                                  ? Colors.green
                                                                  // en cour
                                                                  : Colors
                                                                      .orange,
                                                        ),
                                                        value:
                                                            allUnits.any(
                                                                  (
                                                                    existingUnit,
                                                                  ) =>
                                                                      existingUnit['Unit_id'] ==
                                                                          unit['Unit_id'] &&
                                                                      (existingUnit['Unit_lvl'] !=
                                                                          null),
                                                                )
                                                                ? int.tryParse(
                                                                      allUnits.firstWhere(
                                                                        (
                                                                          existingUnit,
                                                                        ) =>
                                                                            existingUnit['Unit_id'] ==
                                                                                unit['Unit_id'] &&
                                                                            existingUnit['Unit_lvl'] !=
                                                                                null,
                                                                      )['Unit_lvl'],
                                                                    ) ??
                                                                    (unitLvl ==
                                                                            0
                                                                        ? null
                                                                        : unitLvl)
                                                                : (unitLvl == 0
                                                                    ? null
                                                                    : unitLvl),
                                                        hint:
                                                            (unitLvl == 0)
                                                                ? Text(
                                                                  Config.language ==
                                                                          "fr"
                                                                      ? "Non débloqué"
                                                                      : "Not unlocked",
                                                                  style: TextStyle(
                                                                    color:
                                                                        Colors
                                                                            .black,
                                                                  ),
                                                                )
                                                                : (unitLvl ==
                                                                    unitLvlMax)
                                                                ? Text(
                                                                  Config.language ==
                                                                          "fr"
                                                                      ? "Level max"
                                                                      : "Level max",
                                                                  style: TextStyle(
                                                                    color:
                                                                        Colors
                                                                            .black,
                                                                  ),
                                                                )
                                                                : null,
                                                        items: [
                                                          DropdownMenuItem<int>(
                                                            value: 0,
                                                            child: Text(
                                                              Config.language ==
                                                                      "fr"
                                                                  ? "Non débloqué"
                                                                  : "Not unlocked",
                                                              style: TextStyle(
                                                                color:
                                                                    Colors
                                                                        .black,
                                                              ),
                                                            ),
                                                          ),
                                                          ...List.generate(unitLvlMax, (
                                                            index,
                                                          ) {
                                                            int level =
                                                                index + 1;
                                                            return DropdownMenuItem<
                                                              int
                                                            >(
                                                              value: level,
                                                              child: Text(
                                                                level ==
                                                                        unitLvlMax
                                                                    ? 'Level max'
                                                                    : 'Level $level',
                                                                style: TextStyle(
                                                                  color:
                                                                      Colors
                                                                          .black,
                                                                ),
                                                              ),
                                                            );
                                                          }),
                                                        ],
                                                        onChanged: (value) {
                                                          if (value != null) {
                                                            addUnitLevel(allUnits, {
                                                              'Unit_id':
                                                                  unit['Unit_id'],
                                                              'Unit_lvl':
                                                                  value
                                                                      .toString(),
                                                            });
                                                          }
                                                        },
                                                      ),
                                                      SizedBox(height: 10),

                                                      // Affichage du Dropdown pour UserMaitrise
                                                      if (unitMaitrise == 1)
                                                        DropdownButtonFormField<
                                                          int
                                                        >(
                                                          decoration: InputDecoration(
                                                            labelText: '',
                                                            border:
                                                                OutlineInputBorder(),
                                                            filled: true,
                                                            fillColor:
                                                                allUnits.any(
                                                                      (
                                                                        existingUnit,
                                                                      ) =>
                                                                          existingUnit['Unit_id'] ==
                                                                              unit['Unit_id'] &&
                                                                          existingUnit['UserMaitrise'] !=
                                                                              null,
                                                                    )
                                                                    // Valeur changer
                                                                    ? Colors
                                                                        .blue
                                                                        .shade100
                                                                    : (userMaitrise ==
                                                                        0)
                                                                    // Non débloquer
                                                                    ? Colors.red
                                                                    : (userMaitrise ==
                                                                        2)
                                                                    // lvl max
                                                                    ? Colors
                                                                        .green
                                                                    // en cour
                                                                    : Colors
                                                                        .orange,
                                                          ),
                                                          value:
                                                              allUnits.any(
                                                                    (
                                                                      existingUnit,
                                                                    ) =>
                                                                        existingUnit['Unit_id'] ==
                                                                            unit['Unit_id'] &&
                                                                        existingUnit['UserMaitrise'] !=
                                                                            null,
                                                                  )
                                                                  ? int.tryParse(
                                                                        allUnits.firstWhere(
                                                                          (
                                                                            existingUnit,
                                                                          ) =>
                                                                              existingUnit['Unit_id'] ==
                                                                                  unit['Unit_id'] &&
                                                                              existingUnit['UserMaitrise'] !=
                                                                                  null,
                                                                        )['UserMaitrise'],
                                                                      ) ??
                                                                      userMaitrise
                                                                  : userMaitrise,
                                                          items: [
                                                            DropdownMenuItem<
                                                              int
                                                            >(
                                                              value: 0,
                                                              child: Text(
                                                                Config.language ==
                                                                        "fr"
                                                                    ? "Non maitrisé"
                                                                    : "Not mastered",
                                                              ),
                                                            ),
                                                            DropdownMenuItem<
                                                              int
                                                            >(
                                                              value: 1,
                                                              child: Text(
                                                                Config.language ==
                                                                        "fr"
                                                                    ? "Maitrise en cours"
                                                                    : "Mastery in progress",
                                                              ),
                                                            ),
                                                            DropdownMenuItem<
                                                              int
                                                            >(
                                                              value: 2,
                                                              child: Text(
                                                                Config.language ==
                                                                        "fr"
                                                                    ? "Maitrise complète"
                                                                    : "Complete mastery",
                                                              ),
                                                            ),
                                                          ],
                                                          onChanged: (value) {
                                                            if (value != null) {
                                                              addUnitMaitrise(
                                                                allUnits,
                                                                {
                                                                  'Unit_id':
                                                                      unit['Unit_id'],
                                                                  'UserMaitrise':
                                                                      value
                                                                          .toString(),
                                                                },
                                                              );
                                                            }
                                                          },
                                                        ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                );
                              }).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
      ),
    );
  }
}
