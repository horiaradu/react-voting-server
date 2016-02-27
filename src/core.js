import {List, Map} from 'immutable';

export function setEntries(state, entries) {
  return state.set('entries', List(entries));
}

export function next(state) {
  const winners = getWinners(state.get('vote'));
  const entries = state.get('entries').concat(winners);

  if (entries.size == 1) {
    return state
      .remove('vote')
      .remove('entries')
      .set('winner', entries.first());
  } else {
    return state.merge({
      vote: Map({
        pair: entries.take(2)
      }),
      entries: entries.skip(2)
    });
  }
}

function getWinners(vote) {
  if (!vote) {
    return List();
  } else {
    const tally = vote.get('tally');
    return tally
      .reduce(compute, Map({
        votes: 0,
        entries: List()
      }))
      .get('entries');
  }

  function compute(acc, votes, entry) {
    var maxVotes = acc.get('votes');
    if (maxVotes < votes) {
      return Map({
        votes: votes,
        entries: List.of(entry)
      });
    } else if (maxVotes == votes) {
      return acc.merge({
        entries: acc.get('entries').push(entry)
      });
    } else {
      return acc;
    }
  }
}

export function vote(state, entry) {
  const vote = state.get('vote');
  return state.updateIn(
    ['vote', 'tally', entry],
    0,
    tally => tally + 1
  );
}