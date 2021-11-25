import initMatrix from '../../../client/initMatrix';

function AtoZ(aId, bId) {
  let aName = initMatrix.matrixClient.getRoom(aId).name;
  let bName = initMatrix.matrixClient.getRoom(bId).name;

  // remove "#" from the room name
  // To ignore it in sorting
  aName = aName.replaceAll('#', '');
  bName = bName.replaceAll('#', '');

  if (aName.toLowerCase() < bName.toLowerCase()) {
    return -1;
  }
  if (aName.toLowerCase() > bName.toLowerCase()) {
    return 1;
  }
  return 0;
}

function mostRecentlyMessaged(aId, bId) {
  const aTimestamp = initMatrix.matrixClient.getRoom(aId).getLastActiveTimestamp();
  const bTimestamp = initMatrix.matrixClient.getRoom(bId).getLastActiveTimestamp();
  return bTimestamp - aTimestamp;
}

export { AtoZ, mostRecentlyMessaged };
