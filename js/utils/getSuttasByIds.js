
export function getSuttasByIds(suttasIds, availableSuttasJson) 
{
    return Object.keys(availableSuttasJson).reduce((acc, suttaId) => {
      if (suttasIds.includes(suttaId)) {
        acc[suttaId] = availableSuttasJson[suttaId];
      }
      return acc;
    }, {});
  }