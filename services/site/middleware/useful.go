package utils

import (
	"fmt"
	"image/gif"
	"image/jpeg"
	"image/png"
	"log"
	"mime/multipart"
	"os"
	"strings"
	"time"
)

// Vérificateur d'erreurs
func CheckErr(str string, err error) {
	if err != nil {
		fmt.Printf("ERROR : %v\n%v\n__________________________________________\n", str, err)

		// Ouvrir ou créer le fichier de log
		logFile, fileErr := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if fileErr != nil {
			log.Fatalf("Erreur lors de l'ouverture du fichier de log : %v", fileErr)
		}
		defer logFile.Close()

		// Configurer le logger pour écrire dans le fichier
		log.SetOutput(logFile)

		// Log le message d'erreur avec contexte
		log.Printf("ERROR: %s - %v\n__________________________________________\n", str, err)
	}
}

func LogFile(str string) {
	logFile, fileErr := os.OpenFile("logfile.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if fileErr != nil {
		log.Fatalf("Erreur lors de l'ouverture du fichier de log : %v", fileErr)
	}
	defer logFile.Close()
	log.SetOutput(logFile)
	log.Printf("%s", str)
}

// Permet de charger en local une images envoyé via un formulaire (Format supporté : jpeg/jpg, png, gif)
func UploadPicture(fileUpload multipart.File, header *multipart.FileHeader, filePath string) bool {
	typeFile1 := strings.ToLower(filePath[len(filePath)-3:])
	typeFile2 := strings.ToLower(filePath[len(filePath)-4:])

	if typeFile1 == "jpg" || typeFile2 == "jpeg" { // format jpeg/jpg
		image, err := jpeg.Decode(fileUpload)
		CheckErr("Decode jpeg (UploadFile annexe)", err)
		fileLocal, err := os.Create(filePath)
		CheckErr("OS.Create jpg/jpeg (UploadFile annexe)", err)
		opt := jpeg.Options{
			Quality: 90,
		}
		err = jpeg.Encode(fileLocal, image, &opt)
		CheckErr("Encode picture (Annexe)", err)
		fileLocal.Close()
		return true

	} else if typeFile1 == "png" { // format png
		image, err := png.Decode(fileUpload)
		CheckErr("Decode png (UploadFile annexe)", err)
		fileLocal, err := os.Create(filePath)
		CheckErr("OS.Create png (UploadFile annexe)", err)
		err = png.Encode(fileLocal, image)
		CheckErr("Encode picture (Annexe)", err)
		fileLocal.Close()
		return true

	} else if typeFile1 == "gif" { // format gif
		image, err := gif.DecodeAll(fileUpload)
		CheckErr("Decode gif (UploadFile annexe)", err)
		fileLocal, err := os.Create(filePath)
		CheckErr("OS.Create gif (UploadFile annexe)", err)
		err = gif.EncodeAll(fileLocal, image)
		CheckErr("Encode picture (Annexe)", err)
		fileLocal.Close()
		return true
	}
	return false
}

func RegistrationAuthorised() bool {
	now := time.Now()
	weekday := now.Weekday()
	isSaturdayOrTuesday := weekday == time.Saturday || weekday == time.Tuesday
	hour := now.Hour()
	isBetween17And21 := hour > 17 && hour < 21

	if isSaturdayOrTuesday && isBetween17And21 {
		return false
	}
	return true
}
