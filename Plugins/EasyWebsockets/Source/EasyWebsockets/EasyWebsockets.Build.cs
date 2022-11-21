// Copyright 2022 Chris Ringenberg https://www.ringenberg.dev/

// https://docs.unrealengine.com/5.0/en-US/how-to-make-a-gameplay-module-in-unreal-engine/

using UnrealBuildTool;

public class EasyWebsockets : ModuleRules
{
	public EasyWebsockets(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = ModuleRules.PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(
			new string[]
			{
				"Core",
				"WebSockets",
				"JsEnv"
			}
			);
			
		
		PrivateDependencyModuleNames.AddRange(
			new string[]
			{
				"CoreUObject",
				"Engine",
				"Slate",
				"SlateCore",
			}
			);

		PublicDefinitions.Add("WITH_WEBSOCKETS=1");
	}
}
