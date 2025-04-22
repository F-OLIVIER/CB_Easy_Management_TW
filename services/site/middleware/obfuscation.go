package utils

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
)

// Fonction pour obfusquer tous les fichiers JavaScript dans un répertoire
func ObfuscateAllFiles(srcDir, destDir string) {
	fmt.Println("Initialisation obfuscation fichier JS")

	files, err := os.ReadDir(srcDir)
	if err != nil {
		log.Fatalf("Erreur répertoire (ObfuscateAllFiles) : %v", err)
	}

	// Parcourir tous les fichiers du répertoire source
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".js" {
			srcFilePath := filepath.Join(srcDir, file.Name())
			err := obfuscateFile(srcFilePath, destDir)
			if err != nil {
				log.Printf("Erreur d'obfuscation pour %s : %v", file.Name(), err)
			}
		}
	}
}

// Fonction pour obfusquer un fichier JavaScript
func obfuscateFile(filePath, outputDir string) error {
	err := os.MkdirAll(outputDir, os.ModePerm)
	if err != nil {
		return fmt.Errorf("impossible de créer le répertoire (obfuscateFile) : %v", err)
	}

	// Vérifiez si le fichier d'entrée existe
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return fmt.Errorf("le fichier d'entrée n'existe pas (obfuscateFile) : %v", err)
	}
	// Nom du fichier obfusqué
	outputFile := filepath.Join(outputDir, filepath.Base(filePath))

	// Appeler la commande Node.js pour obfusquer le fichier
	cmd := exec.Command("npx", "javascript-obfuscator", filePath, "--output", outputFile)
	// Capture la sortie et l'erreur de la commande
	_, err = cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("erreur lors de l'exécution de la commande d'obfuscation (obfuscateFile) : %v", err)
	}

	return nil
}
