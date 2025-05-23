package data

type DiscordUser struct {
	Id              string `json:"Id"`
	DiscordPhoto    string `json:"Photo"`
	DiscordUsername string `json:"Username"`
}

type UserInfo struct {
	DiscordUsername string `json:"Username"`
	DiscordPhoto    string `json:"Photo"`

	ID                    int
	EtatInscription       int
	GameCharacter_ID      int
	GameCharacter         ListLanguage `json:"GameCharacter"`
	Lvl                   string       `json:"Lvl"`
	Influence             string       `json:"Influence"`
	NbTotalGvG            string       `json:"NbTotalGvG"`
	NbGvGParticiped       string       `json:"NbGvGParticiped"`
	DateLastGvGParticiped ListLanguage `json:"DateLastGvG"`
	UserCaserne           []Unit
	ConnectedSite         string `json:"ConnectedSite"`
	ListDateGvG           [][]string
	CommentGestionnaire   string `json:"CommentGestionnaire"`

	ID_House  int
	ID_Server string `json:"Discord"`
	Language  string `json:"Language"`

	CodeApp string `json:"CodeApp"`
}

type ListLanguage struct {
	FR string `json:"fr"`
	EN string `json:"en"`
}

type ScearchUserInfo struct {
	// Info user
	User_id         string
	DiscordUsername string
	DiscordPhoto    string
	DiscordRole     string
	Language        string
	// Info house
	ID_House     string
	Gestionnaire bool
	Admin        bool
	Owner        bool
}

type Gestion struct {
	Logged       bool   `json:"Logged"`
	MsgErr       string `json:"MsgErr"`
	Notification Notif
	Redirect     string `json:"Redirect"`
	Officier     bool   `json:"Officier"`
	Admin        bool   `json:"Admin"`
	BotActivate  bool   `json:"BotActivate"`
	ListClass    []ListLanguage
	ListUnitType []ListLanguage `json:"ListUnitType"`

	CodeApp string `json:"CodeApp"`
	Valid   bool   `json:"Valid"`
}
type Notif struct {
	Notif   bool         `json:"Notif"`
	Type    string       `json:"Type"`
	Content ListLanguage `json:"content"`
}

type Unit struct {
	ID            string       `json:"Unit_id"`
	Img           string       `json:"Unit_img"`
	Influence     string       `json:"Unit_influence"`
	Lvl           string       `json:"Unit_lvl"`
	LvlMax        string       `json:"Unit_lvlMax"`
	Name          ListLanguage `json:"Unit_name"`
	Type          ListLanguage `json:"Unit_type"`
	Tier          string       `json:"Unit_tier"`
	Maitrise      string       `json:"Unit_maitrise"`
	UserMaitrise  string       `json:"UserMaitrise"`
	DoctrineInflu bool         `json:"DoctrineInflu"`

	Newunitname ListLanguage `json:"New_unit_name"`
}

type ChangeUnitCaserne struct {
	Userid            string     `json:"iduser"`
	NewLvlUnitCaserne [][]string `json:"listNewLvlUnitCaserne"`
	NewAppUnitCaserne []Unit     `json:"listNewAppUnitCaserne"`
}

type UserGvG struct {
	User_ID     int
	Username    string `json:"Username"`
	GroupNumber int    `json:"GroupNumber"`
	Unit1       string `json:"Unit1"`
	Unit2       string `json:"Unit2"`
	Unit3       string `json:"Unit3"`
	Unit4       string `json:"Unit4"`
	Comment     string `json:"commentaire"`
}

type SendHTML struct {
	UserInfo       UserInfo
	ListUnit       []Unit
	Gestion        Gestion
	ListInscripted []UserInfo
	GroupGvG       []UserGvG
	NameGroupGvG   map[int]string
	Screen         []Screen
	House          []Houses
	Statistique    Stat
	Forum          []Post
}

type Houses struct {
	ID         string
	House_name string `json:"House_name"`
	House_logo string `json:"House_logo"`
	Langage    string `json:"Language"`
	ID_Server  string `json:"Discord"`
}

type SaveGroup struct {
	ListGroup  []UserGroup `json:"dataToSend"`
	Namegroup  [][]string  `json:"namegroup"`
	Optiontype string      `json:"optiontype"`
}

type UserGroup struct {
	NameGroup  string   `json:"inputValue"`
	UserToSave []string `json:"selectValues"`
	Comment    string   `json:"commentaire"`
}

type GestionAdministrateBot struct {
	Data AdministrateBot `json:"data"`
	Img  string          `json:"Allumage"`
}

type AdministrateBot struct {
	Allumage           string       `json:"Allumage"`
	NewWeapon          ListLanguage `json:"newWeapon"`
	CreateUnit         Unit         `json:"createUnit"`
	ChangeUnit         Unit         `json:"changeUnit"`
	Resetnbgvg         bool         `json:"resetnbgvg"`
	Informationdiscord bool         `json:"Informationdiscord"`
	DmDiscord          bool         `json:"dmDiscord"`
}

type Screen struct {
	Description string `json:"Description"`
	Img         string `json:"Img"`
}

type SocketMessage struct {
	Type    string            `json:"type"`
	Content map[string]string `json:"content"`
}

type Stat struct {
	Houses   []Houses   `json:"Houses"`
	Nb_Table string     `json:"Nb_Table"`
	List     []UserInfo `json:"List"`
}

type Post struct {
	ID      string `json:"ID"`
	Title   string `json:"Title"`
	Date    string `json:"Date"`
	Author  string `json:"Author"`
	Content string `json:"Content"`
	Valid   bool   `json:"Valid"`
	Archive bool   `json:"Archive"`

	Comments []*Post
}
