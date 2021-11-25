import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { selectSpace, selectRoom } from '../../../client/action/navigation';
import Postie from '../../../util/Postie';

import Text from '../../atoms/text/Text';
import Selector from './Selector';

import { AtoZ, mostRecentlyMessaged } from './common';

const drawerPostie = new Postie();
function Home({ spaceId }) {
  const [, forceUpdate] = useState({});
  const { roomList, notifications, roomsInput } = initMatrix;
  let spaceIds = [];
  let roomIds = [];

  // using a ref so that messageSentInRoom can access current value (see https://dmitripavlutin.com/react-hooks-stale-closures/#31-useeffect)
  const directIds = useRef([]);

  const spaceChildIds = roomList.getSpaceChildren(spaceId);
  if (spaceChildIds) {
    spaceIds = spaceChildIds.filter((roomId) => roomList.spaces.has(roomId)).sort(AtoZ);
    roomIds = spaceChildIds.filter((roomId) => roomList.rooms.has(roomId)).sort(AtoZ);
    directIds.current = spaceChildIds.filter((roomId) => roomList.directs.has(roomId)).sort(AtoZ);
  } else {
    spaceIds = [...roomList.spaces]
      .filter((roomId) => !roomList.roomIdToParents.has(roomId)).sort(AtoZ);
    roomIds = [...roomList.rooms]
      .filter((roomId) => !roomList.roomIdToParents.has(roomId)).sort(AtoZ);
  }

  // TODO: temporary, remove later: combines all rooms and DMs into single list
  // (using directIds list since this list is displayed with profile pictures in sidebar)
  directIds.current = [...roomIds, ...roomList.directs].sort(mostRecentlyMessaged);
  roomIds = [];

  function selectorChanged(selectedRoomId, prevSelectedRoomId) {
    if (!drawerPostie.hasTopic('selector-change')) return;
    const addresses = [];
    if (drawerPostie.hasSubscriber('selector-change', selectedRoomId)) addresses.push(selectedRoomId);
    if (drawerPostie.hasSubscriber('selector-change', prevSelectedRoomId)) addresses.push(prevSelectedRoomId);
    if (addresses.length === 0) return;
    drawerPostie.post('selector-change', addresses, selectedRoomId);
  }
  function messageSentInRoom(roomId) {
    // if room not already at top, re-sort list (since it's now room with most recent message)
    if (directIds.current[0] !== roomId) {
      forceUpdate({});
    }
  }
  function notiChanged(roomId, total, prevTotal) {
    if (total === prevTotal) return;
    if (drawerPostie.hasTopicAndSubscriber('unread-change', roomId)) {
      drawerPostie.post('unread-change', roomId);
    }
    messageSentInRoom(roomId);
  }

  function roomListUpdated() {
    const { spaces, rooms, directs } = initMatrix.roomList;
    if (!(
      spaces.has(navigation.selectedRoomId)
      || rooms.has(navigation.selectedRoomId)
      || directs.has(navigation.selectedRoomId))
    ) {
      selectRoom(null);
    }
    forceUpdate({});
  }

  useEffect(() => {
    roomList.on(cons.events.roomList.ROOMLIST_UPDATED, roomListUpdated);
    navigation.on(cons.events.navigation.ROOM_SELECTED, selectorChanged);
    notifications.on(cons.events.notifications.NOTI_CHANGED, notiChanged);
    roomsInput.on(cons.events.roomsInput.MESSAGE_SENT, messageSentInRoom);
    return () => {
      roomList.removeListener(cons.events.roomList.ROOMLIST_UPDATED, roomListUpdated);
      navigation.removeListener(cons.events.navigation.ROOM_SELECTED, selectorChanged);
      notifications.removeListener(cons.events.notifications.NOTI_CHANGED, notiChanged);
      roomsInput.removeListener(cons.events.roomsInput.MESSAGE_SENT, messageSentInRoom);
    };
  }, []);

  return (
    <>
      { spaceIds.length !== 0 && <Text className="cat-header" variant="b3">Spaces</Text> }
      { spaceIds.map((id) => (
        <Selector
          key={id}
          roomId={id}
          isDM={false}
          drawerPostie={drawerPostie}
          onClick={() => selectSpace(id)}
        />
      ))}

      { roomIds.length !== 0 && <Text className="cat-header" variant="b3">Rooms</Text> }
      { roomIds.map((id) => (
        <Selector
          key={id}
          roomId={id}
          isDM={false}
          drawerPostie={drawerPostie}
          onClick={() => selectRoom(id)}
        />
      )) }

      { directIds.current.length !== 0 && <Text className="cat-header" variant="b3">People</Text> }
      { directIds.current.map((id) => (
        <Selector
          key={id}
          roomId={id}
          drawerPostie={drawerPostie}
          onClick={() => selectRoom(id)}
        />
      ))}
    </>
  );
}
Home.defaultProps = {
  spaceId: null,
};
Home.propTypes = {
  spaceId: PropTypes.string,
};

export default Home;
