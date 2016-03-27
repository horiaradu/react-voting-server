import {List, Map} from 'immutable';

export function setEntries(state, entries) {
  const entriesList = List(entries);
  return state
    .set('entries', entriesList)
    .set('initialEntries', entriesList);
}

export function next(state, roundId = state.getIn(['vote', 'id'], 0) + 1) {
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
        pair: entries.take(2),
        id: roundId
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
    if (tally) {
      return tally
        .reduce(compute, Map({
          votes: 0,
          entries: List()
        }))
        .get('entries');
    } else {
      return vote.get('pair');
    }
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

export function vote(voteState, entry, voterId) {
  return addVote(
    removePreviousVote(voteState, voterId),
    entry,
    voterId
  );
}

function removePreviousVote(voteState, voterId) {
  const votedFor = voteState.getIn(['votes', voterId]);
  if (votedFor) {
    return voteState
      .updateIn(['tally', votedFor], tally => tally - 1)
      .deleteIn(['votes', voterId]);
  } else {
    return voteState;
  }
}

function addVote(voteState, entry, voterId) {
  if (voteState.get('pair').includes(entry)) {
    return voteState
      .updateIn(['tally', entry], 0, tally => tally + 1)
      .setIn(['votes', voterId], entry);
  } else {
    return voteState;
  }
}

export function restart(state) {
  const roundId = state.getIn(['vote', 'id'], 0) + 1;
  return next(
    state
      .set('entries', state.get('initialEntries'))
      .delete('vote')
      .delete('winner'),
    roundId
  );
}