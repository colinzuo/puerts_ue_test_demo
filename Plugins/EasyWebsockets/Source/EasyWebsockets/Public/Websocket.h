// Copyright 2022 Chris Ringenberg https://www.ringenberg.dev/

#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"

#include "ArrayBuffer.h"

#include "Websocket.generated.h"

class IWebSocket;

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnWebSocketConnected);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnWebSocketConnectionError, const FString&, Error);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnWebSocketClosed, int32, StatusCode, const FString&, Reason, bool, bWasClean);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnWebSocketMessageReceived, const FString&, Message);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnWebSocketRawMessageReceived, const FArrayBuffer&, ArrayBuffer, uint32, BytesRemaining);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnWebSocketMessageSent, const FString&, Message);

UCLASS(BlueprintType)
class EASYWEBSOCKETS_API UWebSocket : public UObject
{
	GENERATED_BODY()

public:
	
	UPROPERTY(BlueprintAssignable)
	FOnWebSocketConnected OnWebSocketConnected;

	UPROPERTY(BlueprintAssignable)
	FOnWebSocketConnectionError OnWebSocketConnectionError;

	UPROPERTY(BlueprintAssignable)
	FOnWebSocketClosed OnWebSocketClosed;

	UPROPERTY(BlueprintAssignable)
	FOnWebSocketMessageReceived OnWebSocketMessageReceived;

	UPROPERTY(BlueprintAssignable)
	FOnWebSocketRawMessageReceived OnWebSocketRawMessageReceived;

	UPROPERTY(BlueprintAssignable)
	FOnWebSocketMessageSent OnWebSocketMessageSent;

	void InitWebSocket(TSharedPtr<IWebSocket> InWebSocket);

	UFUNCTION(BlueprintCallable, Category = "Easy WebSockets")
	void Connect();

	UFUNCTION(BlueprintCallable, Category = "Easy WebSockets")
	void Close(int32 StatusCode = 1000, const FString& Reason = TEXT(""));

	UFUNCTION(BlueprintPure, Category = "Easy WebSockets")
	bool IsConnected() const;

	UFUNCTION(BlueprintCallable, Category = "Easy WebSockets")
	void SendMessage(const FString& Message);

	UFUNCTION(BlueprintCallable, Category = "Easy WebSockets")
	void SendRawMessage(const FArrayBuffer& Message, bool bIsBinary = false);

private:
	void OnWebSocketConnected_Internal();

	void OnWebSocketConnectionError_Internal(const FString& Error);

	void OnWebSocketClosed_Internal(int32 StatusCode, const FString& Reason, bool bWasClean);

	void OnWebSocketMessageReceived_Internal(const FString& Message);

	void OnWebSocketRawMessageReceived_Internal(const void* Data, SIZE_T Size, SIZE_T BytesRemaining);

	void OnWebSocketMessageSent_Internal(const FString& Message);
	
	TSharedPtr<IWebSocket> InternalWebSocket;
};