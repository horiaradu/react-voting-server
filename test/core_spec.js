import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';

import {setEntries, next, vote, restart} from '../src/core';

describe('application logic', () => {

  describe('setEntries', () => {

    it('adds the entries to the state', () => {
      const state = Map();
      const entries = List.of('Trainspotting', '28 Days Later');
      const nextState = setEntries(state, entries);
      expect(nextState).to.equal(fromJS({
        entries: ['Trainspotting', '28 Days Later'],
        initialEntries: ['Trainspotting', '28 Days Later']
      }));
    });

    it('converts to immutable', () => {
      const state = Map();
      const entries = ['Trainspotting', '28 Days Later'];
      const nextState = setEntries(state, entries);
      expect(nextState).to.equal(fromJS({
        entries: ['Trainspotting', '28 Days Later'],
        initialEntries: ['Trainspotting', '28 Days Later']
      }));
    });

  });

  describe('restart', () => {
    it('removes the existing voting pair, replacing it with the first pair', () => {
      const state = fromJS({
        vote: {
          pair: ['Trainspotting', '28 Days Later'],
          tally: {
            'Trainspotting': 4,
            '28 Days Later': 2
          },
          id: 1
        },
        entries: ['Sunshine', 'Millions', '127 Hours'],
        initialEntries: ['Sunshine', 'Millions', '127 Hours', 'Trainspotting', '28 Days Later']
      });
      const nextState = restart(state);
      expect(nextState).to.equal(fromJS({
        vote: {
          pair: ['Sunshine', 'Millions'],
          id: 2
        },
        entries: ['127 Hours', 'Trainspotting', '28 Days Later'],
        initialEntries: ['Sunshine', 'Millions', '127 Hours', 'Trainspotting', '28 Days Later']
      }));
    });

    it('removes the winner', () => {
      const state = fromJS({
        winner: 'Trainspotting',
        initialEntries: ['Sunshine', 'Millions', '127 Hours', 'Trainspotting', '28 Days Later']
      });
      const nextState = restart(state);
      expect(nextState).to.equal(fromJS({
        vote: {
          pair: ['Sunshine', 'Millions'],
          id: 1
        },
        entries: ['127 Hours', 'Trainspotting', '28 Days Later'],
        initialEntries: ['Sunshine', 'Millions', '127 Hours', 'Trainspotting', '28 Days Later']
      }));
    });

    it('restarting the first round will reset the vote and increment the round id', () => {
      const state = fromJS({
        vote: {
          pair: ['Trainspotting', '28 Days Later'],
          tally: {
            'Trainspotting': 4,
            '28 Days Later': 2
          },
          id: 1
        },
        entries: ['Sunshine', 'Millions', '127 Hours'],
        initialEntries: ['Trainspotting', '28 Days Later', 'Sunshine', 'Millions', '127 Hours']
      });
      const nextState = restart(state);
      expect(nextState).to.equal(fromJS({
        vote: {
          pair: ['Trainspotting', '28 Days Later'],
          id: 2
        },
        entries: ['Sunshine', 'Millions', '127 Hours'],
        initialEntries: ['Trainspotting', '28 Days Later', 'Sunshine', 'Millions', '127 Hours']
      }));
    });

    it('restarting in the initial state takes the next two entries under vote', () => {
      const state = fromJS({
        entries: ['Trainspotting', '28 Days Later', 'Sunshine'],
        initialEntries: ['Trainspotting', '28 Days Later', 'Sunshine']
      });
      const nextState = restart(state);
      expect(nextState).to.equal(fromJS({
        vote: {
          pair: ['Trainspotting', '28 Days Later'],
          id: 1
        },
        entries: ['Sunshine'],
        initialEntries: ['Trainspotting', '28 Days Later', 'Sunshine']
      }));
    })
  });

  describe('next', () => {

    it('takes the next two entries under vote', () => {
      const state = fromJS({
        entries: ['Trainspotting', '28 Days Later', 'Sunshine']
      });
      const nextState = next(state);
      expect(nextState).to.equal(fromJS({
        vote: {
          pair: ['Trainspotting', '28 Days Later'],
          id: 1
        },
        entries: ['Sunshine']
      }));
    });

    it('puts winner of current vote back to entries', () => {
      const state = fromJS({
        vote: {
          pair: ['Trainspotting', '28 Days Later'],
          tally: {
            'Trainspotting': 4,
            '28 Days Later': 2
          },
          id: 1
        },
        entries: ['Sunshine', 'Millions', '127 Hours']
      });
      const nextState = next(state);
      expect(nextState).to.equal(fromJS({
        vote: {
          pair: ['Sunshine', 'Millions'],
          id: 2
        },
        entries: ['127 Hours', 'Trainspotting']
      }));
    });

    it('puts both from tied vote back to entries', () => {
      const state = fromJS({
        vote: {
          pair: ['Trainspotting', '28 Days Later'],
          tally: {
            'Trainspotting': 2,
            '28 Days Later': 2
          },
          id: 1
        },
        entries: ['Sunshine', 'Millions', '127 Hours']
      });
      const nextState = next(state);
      expect(nextState).to.equal(fromJS({
        vote: {
          pair: ['Sunshine', 'Millions'],
          id: 2
        },
        entries: ['127 Hours', 'Trainspotting', '28 Days Later']
      }));
    });

    it('if no vote has been made puts both back to entries', () => {
      const state = fromJS({
        vote: {
          pair: ['Trainspotting', '28 Days Later'],
          id: 1
        },
        entries: ['Sunshine', 'Millions', '127 Hours']
      });
      const nextState = next(state);
      expect(nextState).to.equal(fromJS({
        vote: {
          pair: ['Sunshine', 'Millions'],
          id: 2
        },
        entries: ['127 Hours', 'Trainspotting', '28 Days Later']
      }));
    });

    it('marks winner when just one entry left', () => {
      const state = fromJS({
        vote: {
          pair: ['Trainspotting', '28 Days Later'],
          tally: {
            'Trainspotting': 4,
            '28 Days Later': 2
          }
        },
        entries: []
      });
      const nextState = next(state);
      expect(nextState).to.equal(Map({
        winner: 'Trainspotting'
      }));
    });
  });

  describe('vote', () => {

    it('creates a tally for the voted entry', () => {
      const state = fromJS({
        pair: ['Trainspotting', '28 Days Later']
      });
      const nextState = vote(state, 'Trainspotting', 'John');
      expect(nextState).to.equal(fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        tally: {
          'Trainspotting': 1
        },
        votes: {
          John: 'Trainspotting'
        }
      }));
    });

    it('adds to existing tally for the voted entry', () => {
      const state = fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        tally: {
          'Trainspotting': 3,
          '28 Days Later': 2
        },
        votes: {}
      });
      const nextState = vote(state, 'Trainspotting', 'John');
      expect(nextState).to.equal(fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        tally: {
          'Trainspotting': 4,
          '28 Days Later': 2
        },
        votes: {
          John: 'Trainspotting'
        }
      }));
    });

    it("overrides the voter's previous vote", () => {
      const state = fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        tally: {
          'Trainspotting': 3,
          '28 Days Later': 2
        },
        votes: {
          John: 'Trainspotting'
        }
      });
      const nextState = vote(state, '28 Days Later', 'John');
      expect(nextState).to.equal(fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        tally: {
          'Trainspotting': 2,
          '28 Days Later': 3
        },
        votes: {
          John: '28 Days Later'
        }
      }));
    });
  });

});
