// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Engine/GameInstance.h"

#include "JsEnv.h"

#include "TsGameInstance.generated.h"

/**
 * 
 */
UCLASS()
class PUERTS_UE_TEST_DEMO_API UTsGameInstance : public UGameInstance
{
	GENERATED_BODY()
	
public:

    virtual void Init() override;

    virtual void OnStart() override;

    virtual void Shutdown() override;

private:
    TSharedPtr<puerts::FJsEnv> GameScript;
};
