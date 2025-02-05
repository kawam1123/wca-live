const { countryByIso2 } = require('../utils/countries');
const { flatMap } = require('../utils/utils');
const { advancingResults } = require('../utils/advancement');

module.exports = {
  id: ({ registrantId }) => registrantId,
  country: ({ countryIso2 }) => countryByIso2(countryIso2),
  results: ({ registrantId }, args, { competition }) => {
    const rounds = flatMap(competition.wcif.events, event => event.rounds);
    const roundsWhereHasResult = rounds.filter(round =>
      round.results.some(({ personId, attempts }) =>
        personId === registrantId && attempts.length > 0
      )
    );
    return roundsWhereHasResult.map(round => {
      const advancing = advancingResults(round, competition.wcif);
      const result = round.results.find(({ personId }) => personId === registrantId);
      return {
        ...result,
        round,
        advancable: advancing.includes(result),
      };
    });
  },
};
