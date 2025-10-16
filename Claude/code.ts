// This plugin creates design suggestions using AI

figma.showUI(__html__, { width: 450, height: 700 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'apply-styles') {
    await applyStylesToFigma(msg.data);
    figma.notify('✅ Design styles applied successfully!');
  }
};

async function applyStylesToFigma(suggestions: any) {
  try {
    // Create or update text styles FIRST (before color styles)
    await createTextStyles(suggestions.typography);
    
    // Then create color styles
    await createColorStyles(suggestions.colors);
    
    // Store spacing variables as local variables
    await createSpacingVariables(suggestions.spacing);
    
    figma.notify('✅ Design styles applied successfully!');
  } catch (error) {
    console.error('Error applying styles:', error);
    figma.notify('❌ Error applying some styles: ' + error);
  }
}

async function createColorStyles(colors: any) {
  const colorEntries = Object.entries(colors);
  
  for (const [name, hex] of colorEntries) {
    const hexValue = hex as string;
    const rgb = hexToRgb(hexValue);
    
    // Check if style already exists
    let paintStyle = figma.getLocalPaintStyles().find(
      style => style.name === `AI/${capitalize(name)}`
    );
    
    if (!paintStyle) {
      paintStyle = figma.createPaintStyle();
      paintStyle.name = `AI/${capitalize(name)}`;
    }
    
    paintStyle.paints = [{
      type: 'SOLID',
      color: { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 }
    }];
  }
}

async function createTextStyles(typography: any) {
  const styles = [
    { name: 'H1', size: parseInt(typography.sizes.h1), font: typography.headingFont, weight: 'Bold' },
    { name: 'H2', size: parseInt(typography.sizes.h2), font: typography.headingFont, weight: 'SemiBold' },
    { name: 'H3', size: parseInt(typography.sizes.h3), font: typography.headingFont, weight: 'Medium' },
    { name: 'Body', size: parseInt(typography.sizes.body), font: typography.bodyFont, weight: 'Regular' },
    { name: 'Small', size: parseInt(typography.sizes.small), font: typography.bodyFont, weight: 'Regular' },
  ];
  
  for (const style of styles) {
    try {
      // Try loading the font with specified weight
      let fontLoaded = false;
      let finalWeight = style.weight;
      
      try {
        await figma.loadFontAsync({ family: style.font, style: style.weight });
        fontLoaded = true;
      } catch (e) {
        // Try common weight alternatives
        const weightAlternatives = ['Regular', 'Medium', 'SemiBold', 'Bold', 'Light'];
        for (const altWeight of weightAlternatives) {
          try {
            await figma.loadFontAsync({ family: style.font, style: altWeight });
            finalWeight = altWeight;
            fontLoaded = true;
            break;
          } catch (err) {
            continue;
          }
        }
      }
      
      if (!fontLoaded) {
        console.warn(`Could not load font ${style.font}, skipping...`);
        continue;
      }
      
      let textStyle = figma.getLocalTextStyles().find(
        ts => ts.name === `AI/${style.name}`
      );
      
      if (!textStyle) {
        textStyle = figma.createTextStyle();
        textStyle.name = `AI/${style.name}`;
      }
      
      textStyle.fontSize = style.size;
      textStyle.fontName = { family: style.font, style: finalWeight };
      textStyle.lineHeight = { unit: 'PERCENT', value: 140 };
      
    } catch (error) {
      console.error(`Error creating text style ${style.name}:`, error);
    }
  }
}

async function createSpacingVariables(spacing: any) {
  // Store spacing as local variables (Figma's new way to store design tokens)
  const spacingEntries = Object.entries(spacing);
  
  for (const [name, value] of spacingEntries) {
    try {
      const collection = figma.variables.getLocalVariableCollections().find(
        c => c.name === 'AI Spacing'
      ) || figma.variables.createVariableCollection('AI Spacing');
      
      const existingVar = figma.variables.getLocalVariables().find(
        v => v.name === `spacing/${name}`
      );
      
      if (!existingVar) {
        const variable = figma.variables.createVariable(
          `spacing/${name}`,
          collection,
          'FLOAT'
        );
        
        const numValue = parseFloat((value as string).replace('px', ''));
        variable.setValueForMode(collection.modes[0].modeId, numValue);
      }
    } catch (error) {
      console.error('Error creating spacing variable:', error);
    }
  }
}

function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}