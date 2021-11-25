import React, { useState, useEffect } from 'react';
import './Client.scss';

import Text from '../../atoms/text/Text';
import Spinner from '../../atoms/spinner/Spinner';
import Navigation from '../../organisms/navigation/Navigation';
import Room from '../../organisms/room/Room';
import Windows from '../../organisms/pw/Windows';
import Dialogs from '../../organisms/pw/Dialogs';
import EmojiBoardOpener from '../../organisms/emoji-board/EmojiBoardOpener';
import RoomOptions from '../../organisms/room-optons/RoomOptions';
import logout from '../../../client/action/logout';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';

const setNotificationBadge = () => {
  const { roomList, notifications } = initMatrix;
  if (roomList && notifications) {
    const roomIds = [...roomList.rooms, ...roomList.directs]; // combine group chats and DMs
    let totalUnreadChats = 0;
    roomIds.forEach((roomId) => {
      if (notifications.hasNoti(roomId)) {
        totalUnreadChats += 1;
      }
    });

    if (totalUnreadChats > 0) {
      navigator.setAppBadge(totalUnreadChats);
    } else {
      navigator.clearAppBadge();
    }
  }
};

const onNotificationChange = (roomId, total, prevTotal) => {
  if (total !== prevTotal) {
    setNotificationBadge();
  }
};

function Client() {
  const [isLoading, changeLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Heating up');

  useEffect(() => {
    let counter = 0;
    const iId = setInterval(() => {
      const msgList = [
        'Sometimes it takes a while...',
        'Looks like you have a lot of stuff to heat up!',
      ];
      if (counter === msgList.length - 1) {
        setLoadingMsg(msgList[msgList.length - 1]);
        clearInterval(iId);
        return;
      }
      setLoadingMsg(msgList[counter]);
      counter += 1;
    }, 9000);

    initMatrix.once('init_loading_finished', () => {
      clearInterval(iId);
      changeLoading(false);

      const { notifications } = initMatrix;
      if (notifications) {
        notifications.on(cons.events.notifications.NOTI_CHANGED, onNotificationChange);
      }
      setNotificationBadge();
    });

    initMatrix.init();

    return () => {
      const { notifications } = initMatrix;
      if (notifications) {
        notifications.removeListener(cons.events.notifications.NOTI_CHANGED, onNotificationChange);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="loading-display">
        <button className="loading__logout" onClick={logout} type="button">
          <Text variant="b3">Logout</Text>
        </button>
        <Spinner />
        <Text className="loading__message" variant="b2">{loadingMsg}</Text>

        <div className="loading__appname">
          <Text variant="h2">Cinny</Text>
        </div>
      </div>
    );
  }
  return (
    <div className="client-container">
      <div className="navigation__wrapper">
        <Navigation />
      </div>
      <div className="room__wrapper">
        <Room />
      </div>
      <Windows />
      <Dialogs />
      <EmojiBoardOpener />
      <RoomOptions />
    </div>
  );
}

export default Client;
