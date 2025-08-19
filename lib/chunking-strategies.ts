interface Chunk {
  content: string;
  heading?: string;
  page?: number;
  startTime?: number;
  endTime?: number;
  contentType: 'guide' | 'carrier' | 'training' | 'regulation';
  tokenCount: number;
  metadata: Record<string, any>;
}

interface VTTBlock {
  start: number;
  end: number;
  text: string;
}

export class InsuranceChunkingStrategies {
  private static countTokens(text: string): number {
    return Math.ceil(text.split(/\s+/).length * 1.3);
  }

  static chunkGovernmentGuide(text: string, title: string): Chunk[] {
    const chunks: Chunk[] = [];
    const sections = text.split(/\n(?=#+\s)/);
    
    for (const section of sections) {
      const lines = section.split('\n');
      const heading = lines[0]?.replace(/^#+\s*/, '') || 'Introduction';
      const content = lines.slice(1).join('\n').trim();
      
      if (content.length < 50) continue;
      
      const subChunks = this.splitByTokenLimit(content, 512, 20);
      
      subChunks.forEach((chunk, index) => {
        chunks.push({
          content: chunk,
          heading: index === 0 ? heading : `${heading} (continued ${index + 1})`,
          contentType: 'guide',
          tokenCount: this.countTokens(chunk),
          metadata: {
            source: 'government',
            title,
            section: heading,
            subsection: index
          }
        });
      });
    }
    
    return chunks;
  }

  static chunkCarrierData(carrierData: any): Chunk[] {
    const chunks: Chunk[] = [];
    
    const summaryContent = `
      Carrier: ${carrierData.name}
      State: ${carrierData.state}
      Plan Types: ${carrierData.planTypes?.join(', ') || 'Not specified'}
      Rating: ${carrierData.rating || 'Not rated'}
      Network Size: ${carrierData.networkSize || 'Not specified'}
      Premium Range: ${carrierData.premiumRange || 'Contact for pricing'}
    `.trim();
    
    chunks.push({
      content: summaryContent,
      contentType: 'carrier',
      tokenCount: this.countTokens(summaryContent),
      metadata: {
        carrierId: carrierData.id,
        carrierName: carrierData.name,
        state: carrierData.state,
        type: 'summary'
      }
    });

    if (carrierData.plans && Array.isArray(carrierData.plans)) {
      carrierData.plans.forEach((plan: any, index: number) => {
        const planContent = `
          Plan: ${plan.name}
          Type: ${plan.type}
          Deductible: ${plan.deductible || 'Varies'}
          Premium: ${plan.premium || 'Contact for quote'}
          Coverage: ${plan.coverage || 'Standard ACA coverage'}
          Network: ${plan.network || 'Standard network'}
          Benefits: ${plan.benefits?.join(', ') || 'Standard benefits'}
        `.trim();
        
        chunks.push({
          content: planContent,
          contentType: 'carrier',
          tokenCount: this.countTokens(planContent),
          metadata: {
            carrierId: carrierData.id,
            carrierName: carrierData.name,
            state: carrierData.state,
            planId: plan.id,
            planName: plan.name,
            type: 'plan'
          }
        });
      });
    }

    if (carrierData.stateRegulations) {
      const regulationContent = `
        State Regulations for ${carrierData.state}:
        ${carrierData.stateRegulations}
      `.trim();
      
      chunks.push({
        content: regulationContent,
        contentType: 'regulation',
        tokenCount: this.countTokens(regulationContent),
        metadata: {
          carrierId: carrierData.id,
          state: carrierData.state,
          type: 'regulation'
        }
      });
    }
    
    return chunks;
  }

  static chunkTrainingVideo(vttContent: string, videoTitle: string, videoId: string): Chunk[] {
    const chunks: Chunk[] = [];
    const vttBlocks = this.parseVTT(vttContent);
    
    let currentChunk = '';
    let chunkStartTime = 0;
    let chunkEndTime = 0;
    let currentTokens = 0;
    
    for (let i = 0; i < vttBlocks.length; i++) {
      const block = vttBlocks[i];
      const blockTokens = this.countTokens(block.text);
      
      if (currentTokens + blockTokens > 400 && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          startTime: chunkStartTime,
          endTime: chunkEndTime,
          contentType: 'training',
          tokenCount: currentTokens,
          metadata: {
            videoId,
            videoTitle,
            chunkIndex: chunks.length,
            duration: chunkEndTime - chunkStartTime
          }
        });
        
        currentChunk = block.text;
        chunkStartTime = block.start;
        chunkEndTime = block.end;
        currentTokens = blockTokens;
      } else {
        if (currentChunk.length === 0) {
          chunkStartTime = block.start;
        }
        currentChunk += (currentChunk.length > 0 ? ' ' : '') + block.text;
        chunkEndTime = block.end;
        currentTokens += blockTokens;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        startTime: chunkStartTime,
        endTime: chunkEndTime,
        contentType: 'training',
        tokenCount: currentTokens,
        metadata: {
          videoId,
          videoTitle,
          chunkIndex: chunks.length,
          duration: chunkEndTime - chunkStartTime
        }
      });
    }
    
    return chunks;
  }

  static chunkStateRegulations(regulationText: string, state: string): Chunk[] {
    const chunks: Chunk[] = [];
    const sections = regulationText.split(/\n(?=(?:Section|Article|Chapter)\s+\d+)/i);
    
    for (const section of sections) {
      const lines = section.split('\n');
      const heading = lines[0]?.trim() || 'General Regulations';
      const content = lines.slice(1).join('\n').trim();
      
      if (content.length < 100) continue;
      
      const subChunks = this.splitByTokenLimit(content, 600, 30);
      
      subChunks.forEach((chunk, index) => {
        chunks.push({
          content: chunk,
          heading: index === 0 ? heading : `${heading} (Part ${index + 1})`,
          contentType: 'regulation',
          tokenCount: this.countTokens(chunk),
          metadata: {
            state,
            section: heading,
            subsection: index,
            source: 'state_regulation'
          }
        });
      });
    }
    
    return chunks;
  }

  private static splitByTokenLimit(text: string, maxTokens: number, overlap: number): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    let currentTokens = 0;
    
    for (const sentence of sentences) {
      const sentenceTokens = this.countTokens(sentence);
      
      if (currentTokens + sentenceTokens > maxTokens && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        
        const overlapText = this.getLastNTokens(currentChunk, overlap);
        currentChunk = overlapText + sentence;
        currentTokens = this.countTokens(currentChunk);
      } else {
        currentChunk += (currentChunk.length > 0 ? '. ' : '') + sentence;
        currentTokens += sentenceTokens;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  private static getLastNTokens(text: string, n: number): string {
    const words = text.split(/\s+/);
    return words.slice(-n).join(' ') + (words.length > n ? ' ' : '');
  }

  private static parseVTT(vttContent: string): VTTBlock[] {
    const blocks: VTTBlock[] = [];
    const lines = vttContent.split('\n');
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (line.includes('-->')) {
        const [startStr, endStr] = line.split('-->').map(s => s.trim());
        const start = this.parseVTTTime(startStr);
        const end = this.parseVTTTime(endStr);
        
        i++;
        let text = '';
        while (i < lines.length && lines[i].trim() !== '') {
          text += (text.length > 0 ? ' ' : '') + lines[i].trim();
          i++;
        }
        
        if (text.length > 0) {
          blocks.push({ start, end, text: text.replace(/<[^>]*>/g, '') });
        }
      }
      i++;
    }
    
    return blocks;
  }

  private static parseVTTTime(timeStr: string): number {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
    } else if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return parseInt(minutes) * 60 + parseFloat(seconds);
    }
    return 0;
  }
}
