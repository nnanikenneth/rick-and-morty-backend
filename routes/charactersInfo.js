const express = require( 'express' );
const routeValidator = require( 'express-route-validator' );
const NodeCache = require( "node-cache" );

const characterInfoTransformer = require('../utils/characterInfoTransformer');
const fetchData = require('../utils/fetchData');
const api = new express.Router();
const myCache = new NodeCache();

/**
* @api {get}
* @apiGroup Returns a list of character information from Rick and Morty api 
* @apiGroup Uses a simple nodejs caching layer for optimisation (could also be redis or memcache)
* @apiParam  {Integer} [page] page
* Example: QueryParams: ?page=3
* @apiSuccess (200) {Object} containing a list or collection of `Character` objects
*/
api.get ('/charactersinfo',  routeValidator.validate({
        query: {
            page: { isRequired: false, isInt: true },
        }}), async (req, res) => {
    
    let page = parseInt(req.query.page, 10) || 1;
    try {
        /* myCache.get() Returns undefined if there is a cache miss */
        const charactersUrl = `https://rickandmortyapi.com/api/character?page=${page}`;
        const charactersInfo = await fetchData(charactersUrl);
        let characterToEpisodesMap = myCache.get("characterIdToEpisodes");
        /*
        * If there is a cache miss 
        * fetch episodic infomation and populate cache with mapping
        */
        if(characterToEpisodesMap === undefined){
            const episodesUrlPage1 = `https://rickandmortyapi.com/api/episode?page=1`;
            const episodesUrlPage2 = `https://rickandmortyapi.com/api/episode?page=2`;
            let [episodesInfo, tempEpisodesInfo] = await Promise.all([
                fetchData(episodesUrlPage1), 
                fetchData(episodesUrlPage2)]
            );
            episodesInfo.results = episodesInfo.results.concat(tempEpisodesInfo.results);
            characterToEpisodesMap = populateCharacterIdToEpisodesMapping(episodesInfo);
        }     
         
        return res.status(200).json(characterInfoTransformer(charactersInfo, characterToEpisodesMap));

    } catch (error) {
        return res.status(500).json({
          error: error,
        });
    }
});

/*
* Processes characterId to episode list mapping
* Sets the cache key "characterIdToEpisodes" mapped 
* to characterIdToEpisodesMap in the caching layer
* Returns characterIdToEpisodesMap 
* @param episodesInfo: Object
*/
const populateCharacterIdToEpisodesMapping = (episodesInfo) => {
        let characterIdToEpisodesMap = {};
        for(const epIndex in episodesInfo.results){
            const charactersList = episodesInfo.results[epIndex].characters;
            const episode = episodesInfo.results[epIndex].episode;
            for(charIndex in charactersList){
                if(charactersList.length){
                    const characterId = charactersList[charIndex].split('/').reverse()[0];
                    if( characterIdToEpisodesMap.hasOwnProperty(characterId) ){
                        characterIdToEpisodesMap[characterId].push(episode);
                    }else{
                        characterIdToEpisodesMap[characterId] = [episode];
                    }
                }
            }
        }
        // Persist in cache
        myCache.set( "characterIdToEpisodes", characterIdToEpisodesMap )
        return characterIdToEpisodesMap;
}

module.exports = api;
