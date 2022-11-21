// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class puerts_ue_test_demo : ModuleRules
{
	public puerts_ue_test_demo(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore", "HeadMountedDisplay" });
	}
}
