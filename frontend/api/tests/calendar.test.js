const {
  getCalendarNotes,
  addCalendarNote,
  removeCalendarNote,
} = require('../calendar');
const { registerAndLogin } = require('./testutil');

beforeEach((done) => {
  registerAndLogin()
    .then(() => {
      done();
    })
    .catch((error) => {
      done(error);
    });
});

it('Calendar notes are empty by default', () => {
  expect(getCalendarNotes()).resolves.toStrictEqual({});
});

it('Can add calendar note', (done) => {
  addCalendarNote('1-1-2021', 'Hello world', 'red')
    .then(() => {
      // Check that the note was really added
      expect(getCalendarNotes()).resolves.toStrictEqual({
        '1-1-2021': [{
          note: 'Hello world',
          dots: 'red',
        }],
      });
      done();
    })
    .catch((error) => {
      done(error);
    });
});

it('Can have multiple calendar notes', (done) => {
  addCalendarNote('1-1-2021', 'Hello world 1', 'red')
    .then(() => {
      addCalendarNote('1-2-2021', 'Hello world 2', 'green')
        .then(() => {
          expect(getCalendarNotes()).resolves.toStrictEqual({
            '1-1-2021': [{
              note: 'Hello world 1',
              dots: 'red',
            }],
            '1-2-2021': [{
              note: 'Hello world 2',
              dots: 'green',
            }],
          });
          done();
        })
        .catch((error) => {
          done(error);
        });
    })
    .catch((error) => {
      done(error);
    });
});

it('Can have multiple calendar notes on the same day', (done) => {
  addCalendarNote('1-1-2021', 'Hello world 1', 'red')
    .then(() => {
      addCalendarNote('1-1-2021', 'Hello world 2', 'green')
        .then(() => {
          getCalendarNotes()
            .then((notes) => {
              expect(notes).toBeTruthy();
              expect(Object.keys(notes)).toStrictEqual(['1-1-2021']);
              expect(notes['1-1-2021'].sort()).toStrictEqual([{
                note: 'Hello world 1',
                dots: 'red',
              },
              {
                note: 'Hello world 2',
                dots: 'green',
              }].sort());

              done();
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    })
    .catch((error) => {
      done(error);
    });
});

it('Can remove calendar notes', (done) => {
  addCalendarNote('1-1-2021', 'Hello world 1', 'red')
    .then(() => {
      addCalendarNote('1-2-2021', 'Hello world 2', 'green')
        .then(() => {
          // Remove the first note
          removeCalendarNote('1-1-2021', { note: 'Hello world 1', dots: 'red' })
            .then((removed) => {
              expect(removed).toBe(true);

              // Check that the note was actually removed
              expect(getCalendarNotes()).resolves.toStrictEqual({
                '1-2-2021': [{
                  note: 'Hello world 2',
                  dots: 'green',
                }],
              });
              done();
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    })
    .catch((error) => {
      done(error);
    });
});

it('Can remove a calendar note from a day with multiple notes', (done) => {
  addCalendarNote('1-1-2021', 'Hello world 1', 'red')
    .then(() => {
      addCalendarNote('1-1-2021', 'Hello world 2', 'green')
        .then(() => {
          // Remove the first note
          removeCalendarNote('1-1-2021', { note: 'Hello world 1', dots: 'red' })
            .then((removed) => {
              expect(removed).toBe(true);

              // Check that the note was actually removed
              expect(getCalendarNotes()).resolves.toStrictEqual({
                '1-1-2021': [{
                  note: 'Hello world 2',
                  dots: 'green',
                }],
              });
              done();
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    })
    .catch((error) => {
      done(error);
    });
});

it('Removing a note that does not exist has no effect', (done) => {
  addCalendarNote('1-2-2021', 'Hello world 2', 'green')
    .then(() => {
      // Remove a non-existing note
      removeCalendarNote('1-1-2021', { note: 'Hello world 2', dots: 'red' })
        .then((removed) => {
          expect(removed).toBe(false);
          // Check that the note was actually removed
          expect(getCalendarNotes()).resolves.toStrictEqual({
            '1-2-2021': [{
              note: 'Hello world 2',
              dots: 'green',
            }],
          });
          done();
        })
        .catch((error) => {
          done(error);
        });
    })
    .catch((error) => {
      done(error);
    });
});
