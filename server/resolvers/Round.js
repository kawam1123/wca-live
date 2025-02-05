const { formatById } = require('../utils/formats');
const { parseActivityCode, eventById, personById } = require('../utils/wcif');
const { friendlyRoundName, roundLabel, roundFinished, roundActive } = require('../utils/rounds');
const { advancingResults, nextQualifyingToRound, missingQualifyingIds } = require('../utils/advancement');

module.exports = {
  format: ({ format }) => formatById(format),
  event: ({ id }, args, { competition }) => {
    const { eventId } = parseActivityCode(id);
    return eventById(competition.wcif, eventId);
  },
  name: ({ id, cutoff }, args, { competition }) => {
    const { eventId, roundNumber } = parseActivityCode(id);
    const event = eventById(competition.wcif, eventId);
    return friendlyRoundName(roundNumber, event.rounds.length, cutoff);
  },
  label: (round) => {
    return roundLabel(round);
  },
  results: (parent, args, { competition }) => {
    const advancing = advancingResults(parent, competition.wcif);
    return parent.results.map(result => ({
      ...result,
      round: parent,
      advancable: advancing.includes(result),
    }));
  },
  open: ({ results }) => results.length > 0,
  finished: (round) => {
    return roundFinished(round);
  },
  active: (round) => {
    return roundActive(round)
  },
  nextQualifying: ({ id }, args, { competition }) => {
    return nextQualifyingToRound(competition.wcif, id).map(
      personId => personById(competition.wcif, personId)
    );
  },
  missingQualifying: ({ id }, args, { competition }) => {
    const { qualifyingIds, excessIds } = missingQualifyingIds(competition.wcif, id);
    return {
      qualifying: qualifyingIds.map(personId => personById(competition.wcif, personId)),
      excess: excessIds.map(personId => personById(competition.wcif, personId)),
    };
  },
};
