import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MomentItem, MomentType, ReactionType } from '@aurora/types';
import { useAuth } from '../../hooks/use-auth';
import { useReactMoment } from '../../hooks/use-interactions';
import { chatService } from '../../services/modules/chat.service';
import { MomentCanvas } from './MomentCanvas';
import { MomentPostMeta } from './MomentPostMeta';
import { MomentCaption } from './MomentCaption';
import { MomentViewerInteractionBar } from './MomentViewerInteractionBar';
import { MomentAuthorInteractionBar } from './MomentAuthorInteractionBar';
import { MomentInteractionsSheet } from './MomentInteractionsSheet';

export interface MomentSlideProps {
  height: number;
  moment: MomentItem;
  onUserPress?: (userId: string) => void;
}

export function MomentSlide({
  height,
  moment,
  onUserPress,
}: MomentSlideProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const reactMomentMutation = useReactMoment();

  const [interactionsSheetVisible, setInteractionsSheetVisible] = useState(false);
  const [burstEmoji, setBurstEmoji] = useState('');
  const [burstKey, setBurstKey] = useState(0);
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  const isOwner = currentUser?.id === moment.userId;
  const reactionsCount = moment.reactionsCount ?? moment._count?.reactions ?? 0;
  const messagesCount = moment.messagesCount ?? moment._count?.messages ?? 0;
  const hasReacted = moment.hasReacted ?? false;
  const userReactionType = moment.userReactionType;

  const handleQuickReaction = (emoji: string, targetType: ReactionType) => {
    const isAlreadyThisReaction = hasReacted && userReactionType === targetType;

    if (isAlreadyThisReaction) {
      reactMomentMutation.mutate({
        momentId: moment.id,
        remove: true,
      });
    } else {
      setBurstEmoji(emoji);
      setBurstKey((prev) => prev + 1);

      reactMomentMutation.mutate({
        momentId: moment.id,
        type: targetType,
        remove: false,
      });
    }
  };

  const handleOpenDirectChat = async () => {
    if (isOwner || !moment.userId || isOpeningChat) return;

    try {
      setIsOpeningChat(true);
      const conversation = await chatService.getOrCreateDirectConversation(moment.userId);
      router.push({
        pathname: '/chat/[id]',
        params: {
          id: conversation.id,
          friendName: moment.user?.displayName || moment.user?.username,
          friendAvatar: moment.user?.avatarUrl || '',
          quotedMomentId: moment.id,
          quotedMomentType: moment.type,
          quotedMomentImage: moment.imageUrl || '',
          quotedMomentContent: moment.content || '',
        },
      });
    } catch (error) {
      console.error('Failed to open chat:', error);
    } finally {
      setIsOpeningChat(false);
    }
  };

  const handleOpenChatWithFriend = (conversationId: string, friend: any) => {
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: conversationId,
        friendName: friend?.displayName || friend?.username,
        friendAvatar: friend?.avatarUrl || '',
        quotedMomentId: moment.id,
        quotedMomentType: moment.type,
        quotedMomentImage: moment.imageUrl || '',
        quotedMomentContent: moment.content || '',
      },
    });
  };

  return (
    <View style={[styles.slideContainer, { height }]}>
      <View style={styles.cardWrapper}>
        {/* 1. SQUARE MOMENT CANVAS (Photo / Note / Mood) */}
        <MomentCanvas
          moment={moment}
          burstEmoji={burstEmoji}
          burstKey={burstKey}
        />

        {/* 2. POST META (User Info, Time, Visibility Badge, Mood Pill) */}
        <MomentPostMeta
          user={moment.user}
          createdAt={moment.createdAt}
          visibility={moment.visibility}
          emotion={moment.emotion}
          momentType={moment.type}
          onUserPress={onUserPress}
        />

        {/* 3. CAPTION FOR PHOTO (Max 2 lines with See More / Less) */}
        {moment.type === MomentType.PHOTO && (
          <MomentCaption content={moment.content} />
        )}

        {/* 4. TWO-ROW INTERACTION BARS (Author vs Viewer) */}
        {isOwner ? (
          <MomentAuthorInteractionBar
            momentId={moment.id}
            reactionsCount={reactionsCount}
            messagesCount={messagesCount}
            onOpenInteractionsSheet={() => setInteractionsSheetVisible(true)}
            onOpenChatWithFriend={handleOpenChatWithFriend}
          />
        ) : (
          <MomentViewerInteractionBar
            hasReacted={hasReacted}
            userReactionType={userReactionType}
            onReactionPress={handleQuickReaction}
            onOpenDirectChat={handleOpenDirectChat}
            isOpeningChat={isOpeningChat}
          />
        )}
      </View>

      {/* Interactions Bottom Sheet for Author */}
      <MomentInteractionsSheet
        visible={interactionsSheetVisible}
        momentId={moment.id}
        onClose={() => setInteractionsSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    width: '100%',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    justifyContent: 'center',
  },
});
