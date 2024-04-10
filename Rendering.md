["Preferred Size" is determined by](https://github.com/LitRitt/DeltaCore/blob/main/DeltaCore/Extensions/UIScreen%2BControllerSkin.swift):
```
if UIDevice.current.userInterfaceIdiom == .pad
{
    switch fixedBounds.width
    {
    case (...768): return .small
    case (...834): return .medium
    default: return .large
    }
}
else
{
    switch fixedBounds.width
    {
    case 320: return .small
    case 375: return .medium
    default: return .large
    }
}
```

[Traits determined by](https://github.com/LitRitt/DeltaCore/blob/e4062dd9fe4c4f9c25d160cf4c35a4afde7fe385/DeltaCore/Model/ControllerSkinTraits.swift#L60)
```
if let scene = window.windowScene, scene.session.role == .windowExternalDisplay
{
    //TODO: Support .portrait TV skins
    device = .tv
    displayType = .standard
    orientation = .landscape
}
else
{
    // Use trait collection to determine device because our container app may be containing us in an "iPhone" trait collection despite being on iPad
    // 99% of the time, won't make a difference ¯\_(ツ)_/¯
    if window.traitCollection.userInterfaceIdiom == .pad
    {
        device = .ipad

        if !window.bounds.equalTo(window.screen.bounds)
        {
            displayType = .splitView

            // Use screen bounds because in split view window bounds might be portrait, but device is actually landscape (and we want landscape skin)
            orientation = (window.screen.bounds.width > window.screen.bounds.height) ? .landscape : .portrait
        }
        else
        {
            displayType = .standard
            orientation = (window.bounds.width > window.bounds.height) ? .landscape : .portrait
        }
    }
    else
    {
        device = .iphone
        displayType = (window.safeAreaInsets.bottom != 0) ? .edgeToEdge : .standard
        orientation = (window.bounds.width > window.bounds.height) ? .landscape : .portrait
    }
}
```

File is [loaded based on preferred size](https://github.com/LitRitt/DeltaCore/blob/e4062dd9fe4c4f9c25d160cf4c35a4afde7fe385/DeltaCore/Model/ControllerSkin.swift#L521) and [gets the following scaling factor applied](https://github.com/LitRitt/DeltaCore/blob/e4062dd9fe4c4f9c25d160cf4c35a4afde7fe385/DeltaCore/Model/ControllerSkin.swift#L919): 
```
func imageScale(for traits: ControllerSkin.Traits) -> CGFloat?
{
    guard let assetSize = self.unwrapped else { return nil }
    
    switch (traits.device, traits.displayType, assetSize)
    {
    case (.iphone, .standard, .small): return 2.0
    case (.iphone, .standard, .medium): return 2.0
    case (.iphone, .standard, .large): return 3.0
        
    case (.iphone, .edgeToEdge, _): return 3.0
    case (.iphone, .splitView, _): return nil
        
    case (.ipad, _, _): return 2.0
        
    case (.tv, _, .small): return 1.0
    case (.tv, _, .medium): return 2.0
    case (.tv, _, .large): return 2.0
        
    case (_, _, .resizable): return nil
    case (_, _, .preview): return 2.0 // TODO: Write better case hnadling of previews, not just a catch-all
    }
}
```

Will be [stretched (?) to full screen in UIImageView](https://github.com/LitRitt/DeltaCore/blob/e4062dd9fe4c4f9c25d160cf4c35a4afde7fe385/DeltaCore/UI/Controller/ButtonsInputView.swift#L52)


- Conclusion: Small / medium / large don't matter, [largest will always be supported](https://github.com/LitRitt/DeltaCore/blob/e4062dd9fe4c4f9c25d160cf4c35a4afde7fe385/DeltaCore/Model/ControllerSkin.swift#L324)
- Created largest representation for different aspect ratios (iphone standard / edgeToEdge, ipad standard / splitView)