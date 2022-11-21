// Copyright 2022 Chris Ringenberg https://www.ringenberg.dev/

#include "WebsocketFunctionLibrary.h"

#include "IWebSocket.h"
#include "Websocket.h"
#include "WebSocketsModule.h"
#include "EasyWebsocketsLog.h"

UWebSocket* UWebSocketFunctionLibrary::CreateWebSocket(FString ServerUrl, FString ServerProtocol)
{
	return CreateWebSocketWithHeaders(ServerUrl, {}, ServerProtocol);
}

UWebSocket* UWebSocketFunctionLibrary::CreateWebSocketWithHeaders(FString ServerUrl, TMap<FString, FString> UpgradeHeaders, FString ServerProtocol)
{
	UE_LOG(LogEasyWebsockets, Log, TEXT("CreateWebSocketWithHeaders ServerUrl %s, ServerProtocol %s"), *ServerUrl, *ServerProtocol);

	const TSharedPtr<IWebSocket> ActualSocket = FModuleManager::LoadModuleChecked<FWebSocketsModule>(TEXT("WebSockets")).CreateWebSocket(ServerUrl, ServerProtocol, UpgradeHeaders);
	UWebSocket* const WrapperSocket = NewObject<UWebSocket>();
	WrapperSocket->InitWebSocket(ActualSocket);
	return WrapperSocket;
}

void UWebSocketFunctionLibrary::SetLogVerbosity(const FString& verbosityStr)
{
	UE_LOG(LogEasyWebsockets, Warning, TEXT("SetLogVerbosity verbosityStr %s"), *verbosityStr);

	ELogVerbosity::Type verbosity = ParseLogVerbosityFromString(verbosityStr);

	LogEasyWebsockets.SetVerbosity(verbosity);
}

FString UWebSocketFunctionLibrary::GetLogVerbosity()
{
	return ToString(LogEasyWebsockets.GetVerbosity());
}