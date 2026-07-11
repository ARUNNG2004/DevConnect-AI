
const LANGUAGE_VERSIONS = {
    javascript: "18.15.0",
    typescript: "5.0.3",
    python: "3.10.0",
    java: "15.ø.2",
    csharp: "6.12.0",
    Php: "8.2.3",
}

const RoomLanguagePicker = () => {
    const languages = Object.entries(LANGUAGE_VERSIONS)

    return (
        <div>
            <ul>
                {languages.map((language, version) => {
                    <li key={language}>{language}
                    &nbsp;
                    <div>{version}</div>
                    </li>
                })}
            </ul>
        </div>
    )
}

export default RoomLanguagePicker
