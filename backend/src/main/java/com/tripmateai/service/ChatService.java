package com.tripmateai.service;
import com.tripmateai.dto.request.chat.ChatMessageRequest;
import com.tripmateai.dto.response.chat.*;
import java.util.List;
public interface ChatService { ChatMessageResponse sendMessage(ChatMessageRequest request); List<ChatHistoryResponse> getChatHistory(Long tripId); }
