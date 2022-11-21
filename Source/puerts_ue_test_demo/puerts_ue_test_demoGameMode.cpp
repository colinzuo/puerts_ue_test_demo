// Copyright Epic Games, Inc. All Rights Reserved.

#include "puerts_ue_test_demoGameMode.h"
#include "puerts_ue_test_demoCharacter.h"
#include "UObject/ConstructorHelpers.h"

Apuerts_ue_test_demoGameMode::Apuerts_ue_test_demoGameMode()
{
	// set default pawn class to our Blueprinted character
	static ConstructorHelpers::FClassFinder<APawn> PlayerPawnBPClass(TEXT("/Game/ThirdPerson/Blueprints/BP_ThirdPersonCharacter"));
	if (PlayerPawnBPClass.Class != NULL)
	{
		DefaultPawnClass = PlayerPawnBPClass.Class;
	}
}
