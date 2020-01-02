/*
* Method to transform to requested response object schema
* @param characterInfo: Object
* @param characterToEpisodesMap: Object
*/
module.exports = characterInfoTransformer = (charactersInfo, characterToEpisodesMap) => {
    let characterList = [];

    for(index in charactersInfo.results){
        const characterId = charactersInfo.results[index].id;
        const result = charactersInfo.results[index];
        const episodes = getEpisodesByCharacterId(characterToEpisodesMap, characterId);
        const data = {
            id: result.id || '',
            name: result.name || '',
            status: result.status || '',
            species: result.species || '',
            type: result.type || '',
            gender: result.gender || '',
            location: result.location.name || '',
            image: result.image || '',
            origin: result.origin.name || '',
            episodes: episodes || [],
        }
        characterList.push(data);
    }

    return {
        page: charactersInfo.info.pages,
        count: charactersInfo.info.count,
        next: charactersInfo.info.next,
        previous: charactersInfo.info.previous,
        characters: characterList,
    } 
}

/* 
* Helper method to gets episodes by character id from
* the character to episodes object mapping
* retrieved from the caching layer
* @param characterToEpisodesMap: Object
* @param characterId: Number
*/
const getEpisodesByCharacterId = (characterToEpisodesMap, characterId) => {
    return characterToEpisodesMap[characterId];
}
