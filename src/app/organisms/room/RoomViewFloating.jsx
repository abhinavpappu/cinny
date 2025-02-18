/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './RoomViewFloating.scss';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';

import Text from '../../atoms/text/Text';
import IconButton from '../../atoms/button/IconButton';

import ChevronBottomIC from '../../../../public/res/ic/outlined/chevron-bottom.svg';

import { getUsersActionJsx } from './common';

function RoomViewFloating({
  roomId, roomTimeline, viewEvent,
}) {
  const [reachedBottom, setReachedBottom] = useState(true);
  const [typingMembers, setTypingMembers] = useState(new Set());
  const mx = initMatrix.matrixClient;

  function isSomeoneTyping(members) {
    const m = members;
    m.delete(mx.getUserId());
    if (m.size === 0) return false;
    return true;
  }

  function getTypingMessage(members) {
    const userIds = members;
    userIds.delete(mx.getUserId());
    return getUsersActionJsx(roomId, [...userIds], 'typing...');
  }

  function updateTyping(members) {
    setTypingMembers(members);
  }
  const handleTimelineScroll = (position) => {
    setReachedBottom(position === 'BOTTOM');
  };

  useEffect(() => {
    setReachedBottom(true);
    setTypingMembers(new Set());
    viewEvent.on('timeline-scroll', handleTimelineScroll);
    return () => viewEvent.removeListener('timeline-scroll', handleTimelineScroll);
  }, [roomId]);

  useEffect(() => {
    roomTimeline.on(cons.events.roomTimeline.TYPING_MEMBERS_UPDATED, updateTyping);
    return () => {
      roomTimeline?.removeListener(cons.events.roomTimeline.TYPING_MEMBERS_UPDATED, updateTyping);
    };
  }, [roomTimeline]);

  return (
    <>
      <div className={`room-view__typing${isSomeoneTyping(typingMembers) ? ' room-view__typing--open' : ''}`}>
        <div className="bouncing-loader"><div /></div>
        <Text variant="b2">{getTypingMessage(typingMembers)}</Text>
      </div>
      <div className={`room-view__STB${reachedBottom ? '' : ' room-view__STB--open'}`}>
        <IconButton
          onClick={() => {
            viewEvent.emit('scroll-to-live');
            setReachedBottom(true);
          }}
          src={ChevronBottomIC}
          tooltip="Scroll to Bottom"
        />
      </div>
    </>
  );
}
RoomViewFloating.propTypes = {
  roomId: PropTypes.string.isRequired,
  roomTimeline: PropTypes.shape({}).isRequired,
  viewEvent: PropTypes.shape({}).isRequired,
};

export default RoomViewFloating;
